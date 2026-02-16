import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EasyWalletRecipient,
  EasyWalletSweepingCommission,
  EasyWalletTransaction,
} from './entities';
import { DepositService } from '../deposit/deposit.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(EasyWalletRecipient)
    private readonly recipientRepository: Repository<EasyWalletRecipient>,
    @InjectRepository(EasyWalletSweepingCommission)
    private readonly sweepingCommissionRepository: Repository<EasyWalletSweepingCommission>,
    @InjectRepository(EasyWalletTransaction)
    private readonly transactionRepository: Repository<EasyWalletTransaction>,
    private readonly depositService: DepositService,
  ) {}

  async getRecipientWallet(
    walletType: string,
  ): Promise<EasyWalletRecipient | null> {
    try {
      const recipient = await this.recipientRepository.findOne({
        where: {
          walletType,
          isDeleted: false,
        },
      });

      return recipient;
    } catch (error) {
      this.logger.debug(`getRecipientWallet error: ${error.message}`);
      return null;
    }
  }

  async getSweepingCommission(
    sweepingCommissionType: string,
  ): Promise<{ id: string; rateCommision: number; sweepingCommissionType: string } | null> {
    try {
      const commission = await this.sweepingCommissionRepository.findOne({
        where: {
          sweepingCommissionType,
          isDeleted: false,
        },
      });

      if (!commission) {
        return null;
      }

      return {
        id: commission.id,
        rateCommision: parseFloat(commission.rateCommision),
        sweepingCommissionType: commission.sweepingCommissionType,
      };
    } catch (error) {
      this.logger.debug(`getSweepingCommission error: ${error.message}`);
      return null;
    }
  }

  async getAmountWithSweepingCommission(
    amount: number,
    rateCommission: number,
  ): Promise<number> {
    const commissionAmount = amount * rateCommission;
    return amount - commissionAmount;
  }

  async getSweepingCommissionAmount(
    amount: number,
    rateCommission: number,
  ): Promise<number> {
    return amount * rateCommission;
  }

  async saveTransaction(transaction: {
    amount: number;
    walletAddressOrigin: string;
    walletAddressDestination: string;
    transactionType: string;
    sweepingCommission: string;
    crypto: string;
    transactionHash?: string;
  }): Promise<EasyWalletTransaction> {
    try {
      const newTransaction = this.transactionRepository.create({
        mount: transaction.amount.toString(),
        walletAddressOrigin: transaction.walletAddressOrigin,
        walletAddressDestination: transaction.walletAddressDestination,
        transactionType: transaction.transactionType,
        sweepingCommission: transaction.sweepingCommission,
        crypto: transaction.crypto,
        transactionHash: transaction.transactionHash || `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });

      const saved = await this.transactionRepository.save(newTransaction);
      this.logger.debug(`Transaction saved: ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.debug(`saveTransaction error: ${error.message}`);
      throw error;
    }
  }

  async processDeposit(
    depositId: string,
  ): Promise<{ status: number; message: string; data?: any; error?: string }> {
    try {
      const clientWallet = await this.depositService.getClientWalletDepositByDepositId(depositId);

      if (!clientWallet) {
        throw new BadRequestException('Client wallet not found');
      }
      
      // 1. Get recipient wallet (global)
      const recipientWallet = await this.getRecipientWallet(
        'global',
      );

      if (!recipientWallet) {
        throw new BadRequestException('Recipient wallet not found');
      }

      // 2. Get sweeping commission
      const commission = await this.getSweepingCommission('deposit');

      if (!commission) {
        throw new BadRequestException('Sweeping commission not found');
      }

      // 3. TODO: Get deposit amount from blockchain or SQS message
      // For now, using a placeholder amount
      const depositAmount = Number(clientWallet.mount);

      // 4. Calculate amounts
      const amountAfterCommission = await this.getAmountWithSweepingCommission(
        depositAmount,
        commission.rateCommision,
      );
      
      const commissionAmount = await this.getSweepingCommissionAmount(
        depositAmount,
        commission.rateCommision,
      );

      // 5. Save transaction
      const transaction = await this.saveTransaction({
        amount: amountAfterCommission,
        walletAddressOrigin: clientWallet.clientWallet.walletAddress,
        walletAddressDestination: recipientWallet.walletAddress,
        transactionType: 'deposit',
        sweepingCommission: commissionAmount.toString(),
        crypto: 'USDC'
      });

      return {
        status: 201,
        message: 'Deposit processed successfully',
        data: {
          transactionId: transaction.id,
          amountAfterCommission,
          commissionAmount,
        },
      };
    } catch (error) {
      this.logger.debug(`processDeposit error: ${error.message}`);

      if (error instanceof BadRequestException) {
        return {
          status: 400,
          message: error.message,
          error: error.message,
        };
      }

      return {
        status: 400,
        message: 'Error processing deposit',
        error: error.message,
      };
    }
  }
}
