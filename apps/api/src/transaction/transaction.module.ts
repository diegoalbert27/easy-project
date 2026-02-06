import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import {
  EasyWalletRecipient,
  EasyWalletSweepingCommission,
  EasyWalletTransaction,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EasyWalletRecipient,
      EasyWalletSweepingCommission,
      EasyWalletTransaction,
    ]),
  ],
  providers: [TransactionService],
})
export class TransactionModule {}
