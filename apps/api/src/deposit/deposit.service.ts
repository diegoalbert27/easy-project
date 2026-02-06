import { Injectable, Inject, Logger } from '@nestjs/common';
import { JsonRpcProvider, ethers } from 'ethers';
import { ETHERS_PROVIDER } from '../infraestructure/ethers/ethers.module';
import { USDC_CONTRACT_ADDRESS, USDC_DECIMALS } from './constants';
import { DepositResult } from './types/deposit-result.type';

@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  constructor(
    @Inject(ETHERS_PROVIDER)
    private readonly provider: JsonRpcProvider,
  ) {}

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
}
