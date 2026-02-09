import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { SQS_CLIENT } from './sqs.constants';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly queueUrl: string;

  constructor(
    @Inject(SQS_CLIENT)
    private readonly sqsClient: SQSClient,
    private readonly configService: ConfigService,
  ) {
    this.queueUrl = this.configService.get<string>('SQS_QUEUE_URL', '');
  }

  async sendMessage(messageBody: object, messageGroupId: string): Promise<string | null> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(messageBody),
        MessageGroupId: messageGroupId,
        MessageDeduplicationId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });

      const response = await this.sqsClient.send(command);
      this.logger.debug(`Message sent: ${response.MessageId}`);
      return response.MessageId || null;
    } catch (error) {
      this.logger.debug(`sendMessage error: ${error.message}`);
      return null;
    }
  }

  async receiveMessages(maxMessages = 10): Promise<Message[]> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: 5,
      });

      const response = await this.sqsClient.send(command);
      return response.Messages || [];
    } catch (error) {
      this.logger.debug(`receiveMessages error: ${error.message}`);
      return [];
    }
  }

  async deleteMessage(receiptHandle: string): Promise<boolean> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
      return true;
    } catch (error) {
      this.logger.debug(`deleteMessage error: ${error.message}`);
      return false;
    }
  }
}
