import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthersModule } from '../infraestructure/ethers/ethers.module';
import { SqsModule } from '../infraestructure/sqs/sqs.module';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { ClientWallet, ClientWalletDeposit } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientWallet, ClientWalletDeposit]),
    EthersModule,
    SqsModule,
  ],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}
