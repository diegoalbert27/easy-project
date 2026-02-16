import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormModule } from './typeorm/typeorm.module';
import { EthersModule } from './ethers/ethers.module';
import { SqsModule } from './sqs/sqs.module';
import { EncryptionModule } from './encryption/encryption.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeormModule,
    EthersModule,
    SqsModule,
    EncryptionModule,
  ],
  exports: [SqsModule, EncryptionModule],
})
export class InfraestructureModule {}
