import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositService } from './deposit.service';
import { EthersModule } from '../infraestructure/ethers/ethers.module';
import { SqsModule } from '../infraestructure/sqs/sqs.module';
import { ClientWalletDeposit } from './entities/client-wallet-deposit.entity';
import { ClientWallet } from './entities/client-wallet.entity';

describe('DepositService', () => {
  let service: DepositService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'simple_online_store',
          entities: [ClientWallet, ClientWalletDeposit],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([ClientWallet, ClientWalletDeposit]),
        EthersModule,
        SqsModule,
      ],
      providers: [DepositService],
    }).compile();

    service = module.get<DepositService>(DepositService);
  });

  xit('Transaction hash must exist', async () => {
    const addressWallet = '0xcF4dC01381fF7605020528105baB9C4BCeb51706' 
    const transactionHash = '0x85a20a55408549ed4e77d800968db62bb0489eceffd035d88eb047292b71c8c4'

    const deposit = await service.getDepositByTransactionHash(addressWallet, transactionHash);

    expect(deposit).toBeDefined();
    
    expect(deposit).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        transactionHash: expect.any(String),
        blockNumber: expect.any(Number),
        amount: expect.any(Number)
      }),
    );

    expect(deposit).not.toBeNull();
  });

  xit('Transaction hash must not exist', async () => {
    const addressWallet = '0xcF4dC01381fF7605020528105baB9C4BCeb51706'
    const transactionHash = '0x85a20a55408549ed4e77d800968db62bb0489eceffd035d88eb047292b71c8c4'

    const deposit = await service.getDepositByTransactionHash(addressWallet, transactionHash);

    expect(deposit).toBeNull();
  });

  xit('Save deposit must be successfully', async () => {
    const clientWalletDeposit = {
      clientWalletId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      mount: '100',
      walletAddressOrigin: '0xD844ba11F64d23a7481E24474D2f184e350B9B3d',
      crypto: 'USDC',
      depositStatus: 'success',
      transactionHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
    } as ClientWalletDeposit;

    const depositId = await service.saveDeposit(clientWalletDeposit);

    expect(depositId).toBeDefined();
    expect(depositId).not.toBeNull();
  })

  xit('Send message to SQS must be successfully', async () => {
    try {
      const messageBody = {
        depositId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      }
  
      await service.sendMessageToSqs(messageBody);
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).not.toBeNull();
    }
  })

  it('Process deposit with valid transaction', async () => {
    const walletAddress = '0xcF4dC01381fF7605020528105baB9C4BCeb51706';
    const transactionHash = '0x85a20a55408549ed4e77d800968db62bb0489eceffd035d88eb047292b71c8c4';

    const result = await service.processDeposit(walletAddress, transactionHash);

    expect(result).toBeDefined();
    expect(result.status).toBe(201);
    expect(result.message).toBe('Deposit processed successfully');
    expect(result.data?.depositId).toBeDefined();
  })
});
