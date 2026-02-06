import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider } from 'ethers';

export const ETHERS_PROVIDER = 'ETHERS_PROVIDER';

@Module({
  providers: [
    {
      provide: ETHERS_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rpcUrl = configService.get<string>(
          'ETH_RPC_URL',
          'https://ethereum-sepolia-rpc.publicnode.com',
        );
        return new JsonRpcProvider(rpcUrl);
      },
    },
  ],
  exports: [ETHERS_PROVIDER],
})
export class EthersModule {}
