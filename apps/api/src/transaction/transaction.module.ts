import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionConsumerService } from './consumers';
import { SqsModule } from '../infraestructure/sqs';
import {
  EasyWalletRecipient,
  EasyWalletSweepingCommission,
  EasyWalletTransaction,
  WalletRecovery,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EasyWalletRecipient,
      EasyWalletSweepingCommission,
      EasyWalletTransaction,
      WalletRecovery,
    ]),
    SqsModule,
  ],
  providers: [TransactionService, TransactionConsumerService],
  exports: [TransactionService],
})
export class TransactionModule {}
