import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SQS_CLIENT } from './sqs.constants';
import { SqsService } from './sqs.service';

@Module({
  providers: [
    {
      provide: SQS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new SQSClient({
          region: configService.get<string>('AWS_REGION', 'us-east-1'),
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID', ''),
            secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
          },
        });
      },
    },
    SqsService,
  ],
  exports: [SQS_CLIENT, SqsService],
})
export class SqsModule {}
