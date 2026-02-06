import { Module } from '@nestjs/common';
import { InfraestructureModule } from './infraestructure/infraestructure.module';
import { DepositModule } from './deposit/deposit.module';
import { TransactionModule } from './transaction/transaction.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    InfraestructureModule,
    DepositModule,
    TransactionModule,
    NotificationModule,
  ],
})
export class AppModule {}
