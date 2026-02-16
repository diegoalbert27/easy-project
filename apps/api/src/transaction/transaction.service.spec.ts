import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { DepositService } from '../deposit/deposit.service';
import {
  EasyWalletRecipient,
  EasyWalletSweepingCommission,
  EasyWalletTransaction,
  WalletRecovery,
} from './entities';
import { ClientWallet, ClientWalletDeposit } from '../deposit/entities';
import { EthersModule } from '../infraestructure/ethers/ethers.module';
import { SqsModule } from '../infraestructure/sqs';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          entities: [
            EasyWalletRecipient,
            EasyWalletSweepingCommission,
            EasyWalletTransaction,
            WalletRecovery,
            ClientWallet,
            ClientWalletDeposit,
          ],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([
          EasyWalletRecipient,
          EasyWalletSweepingCommission,
          EasyWalletTransaction,
          WalletRecovery,
          ClientWallet,
          ClientWalletDeposit,
        ]),
        EthersModule,
        SqsModule,
      ],
      providers: [TransactionService, DepositService],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('Should get recipient wallet', async () => {
    const walletAddress = '0x41458a3E0d0676D083A076689580de632Bcd6E2f';
    const walletType = 'global';

    const recipientWallet = await service.getRecipientWallet(walletType);

    expect(recipientWallet).toBeDefined();
    expect(recipientWallet).not.toBeNull();
    expect(recipientWallet).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        walletAddress: expect.any(String),
        walletType: expect.any(String),
        network: expect.any(String),
        walletProvider: expect.any(String),
      }),
    );
  });

  it('Should get sweeping commission', async () => {
    const sweepingCommission = await service.getSweepingCommission('deposit');

    expect(sweepingCommission).toBeDefined();
    expect(sweepingCommission).not.toBeNull();
    expect(sweepingCommission).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        rateCommision: expect.any(Number),
        sweepingCommissionType: expect.any(String),
      }),
    );
  });

  it('Should get amount with sweeping commission', async () => {
    const amount = await service.getAmountWithSweepingCommission(100, 0.010);

    expect(amount).toBeDefined();
    expect(amount).not.toBeNull();
    expect(amount).toEqual(99);
  });

  it('Should get sweeping commission amount', async () => {
    const amount = await service.getSweepingCommissionAmount(100, 0.010);

    expect(amount).toBeDefined();
    expect(amount).not.toBeNull();
    expect(amount).toEqual(1);
  });

  xit('Should save in database', async () => {
    try {
      const walletAddress = '0xcF4dC01381fF7605020528105baB9C4BCeb51706';
      const walletTo = '0x41458a3E0d0676D083A076689580de632Bcd6E2f';

      const transaction = {
        amount: 100,
        walletAddressOrigin: walletAddress,
        walletAddressDestination: walletTo,
        transactionType: 'deposit',
        sweepingCommission: '0.010',
        crypto: 'USDC',
      };
      
      const saved = await service.saveTransaction(transaction);
      expect(saved).toBeDefined();
      expect(saved.id).toBeDefined();
    } catch (error) {
      expect(error).not.toBeDefined();
    }
  });

  it('Should process deposit', async () => {
    const depositId = '751cd5ce-49e4-4446-bf53-e5f5b7eb362c';
    const result = await service.processDeposit(depositId);

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(result).toEqual(
      expect.objectContaining({
        status: expect.any(Number),
        message: expect.any(String),
        data: expect.objectContaining({
          transactionId: expect.any(String),
          amountAfterCommission: expect.any(Number),
          commissionAmount: expect.any(Number),
        }),
      }),
    );
  });
});
