import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { SqsService } from '../../infraestructure/sqs/sqs.service';
import { Message } from '@aws-sdk/client-sqs';
import { TransactionService } from '../transaction.service';

@Injectable()
export class TransactionConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(TransactionConsumerService.name);
  private isRunning = false;
  private shouldStop = false;

  constructor(private readonly sqsService: SqsService, private readonly transactionService: TransactionService) {}

  onModuleInit() {
    this.startPolling();
  }

  onModuleDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    if (this.isRunning) {
      this.logger.warn('Polling is already running');
      return;
    }

    this.isRunning = true;
    this.shouldStop = false;
    this.logger.log('Starting SQS Long Polling consumer...');
    this.poll();
  }

  private stopPolling() {
    this.logger.log('Stopping SQS Long Polling consumer...');
    this.shouldStop = true;
    this.isRunning = false;
  }

  private async poll() {
    while (!this.shouldStop) {
      try {
        const messages = await this.sqsService.receiveMessagesLongPolling(10);

        if (messages.length > 0) {
          this.logger.debug(`Received ${messages.length} message(s)`);

          for (const message of messages) {
            await this.processMessage(message);
          }
        }
      } catch (error) {
        this.logger.error(`Polling error: ${error.message}`);
        // Wait before retrying on error
        await this.sleep(5000);
      }
    }

    this.logger.log('Polling stopped');
  }

  private async processMessage(message: Message) {
    try {
      const body = JSON.parse(message.Body || '{}');
      this.logger.debug(`Processing message: ${message.MessageId}`);

      // Process the deposit message
      await this.transactionService.processDeposit(body.depositId);

      // Delete message from queue after successful processing
      if (message.ReceiptHandle) {
        await this.sqsService.deleteMessage(message.ReceiptHandle);
        this.logger.debug(`Message deleted: ${message.MessageId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing message ${message.MessageId}: ${error.message}`,
      );
      // Message will return to queue after visibility timeout
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
