import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonRpcProvider, ethers } from 'ethers';
import { ETHERS_PROVIDER } from '../infraestructure/ethers/ethers.module';
import { SqsService } from '../infraestructure/sqs/sqs.service';
import { USDC_CONTRACT_ADDRESS, USDC_DECIMALS } from './constants';
import { DepositResult } from './types/deposit-result.type';
import { DepositResponseDto } from './dtos';
import { ClientWallet, ClientWalletDeposit } from './entities';

@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  constructor(
    @Inject(ETHERS_PROVIDER)
    private readonly provider: JsonRpcProvider,
    @InjectRepository(ClientWalletDeposit)
    private readonly clientWalletDepositRepository: Repository<ClientWalletDeposit>,
    @InjectRepository(ClientWallet)
    private readonly clientWalletRepository: Repository<ClientWallet>,
    private readonly sqsService: SqsService,
  ) {}

  async getClientWalletDepositByDepositId(depositId: string): Promise<ClientWalletDeposit & { clientWallet: ClientWallet } | null> {
    try {
      const deposit = await this.clientWalletDepositRepository.findOne({ where: { id: depositId } });
      
      if (!deposit) {
        throw new BadRequestException('Deposit not found');
      }

      const clientWallet = await this.clientWalletRepository.findOne({ where: { id: deposit.clientWalletId } });
    
      if (!clientWallet) {
      throw new BadRequestException('Client wallet not found');
      }

      return {
        ...deposit,
        clientWallet,
      };
    } catch (error) {
      this.logger.debug(`getClientWalletDepositById error: ${error.message}`);
      throw error;
    }
  }

  async getDepositByTransactionHash(
    addressWallet: string,
    transactionHash: string,
  ): Promise<DepositResult | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);

      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // Find the Transfer log from USDC contract
      const transferLog = receipt.logs.find(
        (log) =>
          log.address.toLowerCase() === USDC_CONTRACT_ADDRESS.toLowerCase(),
      );

      if (!transferLog) {
        throw new Error('USDC transfer log not found');
      }

      // Decode the Transfer event
      const iface = new ethers.Interface([
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ]);

      const decoded = iface.parseLog({
        topics: transferLog.topics as string[],
        data: transferLog.data,
      });

      if (!decoded) {
        throw new Error('Failed to decode transfer log');
      }

      const from = decoded.args[0] as string;
      const to = decoded.args[1] as string;
      const value = decoded.args[2] as bigint;

      // Verify the recipient matches the wallet address
      if (to.toLowerCase() !== addressWallet.toLowerCase()) {
        throw new Error('Recipient address does not match wallet address');
      }

      // Convert value to human readable format (USDC has 6 decimals)
      const amount = Number(ethers.formatUnits(value, USDC_DECIMALS));

      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        amount,
        from,
        to,
      };
    } catch (error) {
      this.logger.debug(`getDepositByTransactionHash error: ${error.message}`);
      return null;
    }
  }

  async saveDeposit(deposit: ClientWalletDeposit): Promise<string | null> {
    try {
      const saved = await this.clientWalletDepositRepository.save(deposit);
      return saved.id;
    } catch (error) {
      this.logger.debug(`saveDeposit error: ${error.message}`);
      return null;
    }
  }

  async sendMessageToSqs(messageBody: { depositId: string }): Promise<string | null> {
    try {
      const messageId = await this.sqsService.sendMessage(messageBody, 'deposits');
      return messageId;
    } catch (error) {
      this.logger.debug(`sendMessageToSqs error: ${error.message}`);
      return null;
    }
  }

  async processDeposit(
    walletAddress: string,
    transactionHash: string
  ): Promise<DepositResponseDto> {
    try {
      // 1. Validate transaction on blockchain
      const txData = await this.getDepositByTransactionHash(walletAddress, transactionHash);
      if (!txData) {
        throw new BadRequestException('Invalid transaction or not found');
      }

      const clientWallet = await this.clientWalletRepository.findOne({ where: { walletAddress: walletAddress } });
      
      if (!clientWallet) {
        throw new BadRequestException('Client wallet not found');
      }

      // 2. Save deposit to database
      const deposit = {
        clientWalletId: clientWallet.id,
        mount: txData.amount.toString(),
        walletAddressOrigin: txData.from,
        crypto: 'USDC',
        depositStatus: txData.status,
        transactionHash: txData.transactionHash,
      } as ClientWalletDeposit;

      const depositId = await this.saveDeposit(deposit);
      if (!depositId) {
        throw new BadRequestException('Failed to save deposit');
      }

      // 3. Send message to SQS queue
      await this.sendMessageToSqs({ depositId });

      return {
        status: 201,
        message: 'Deposit processed successfully',
        data: { depositId },
      };
    } catch (error) {
      this.logger.debug(`processDeposit error: ${error.message}`);
      return {
        status: 400,
        message: 'Failed to process deposit',
        error: error.message,
      };
    }
  }
}
