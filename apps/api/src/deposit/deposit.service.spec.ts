import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DepositService } from './deposit.service';
import { EthersModule } from '../infraestructure/ethers/ethers.module';

describe('DepositService', () => {
  let service: DepositService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
        }),
        EthersModule,
      ],
      providers: [DepositService],
    }).compile();

    service = module.get<DepositService>(DepositService);
  });

  it('Transaction hash must exist', async () => {
    const addressWallet = '0x7186a5f4b0aD40708429c146231a73e085eBe594' 
    const transactionHash = '0x69cde4f59c3cbd1ba1103c962f0176f0747cf1721a3056b8c17d3b430060088f'

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
});
