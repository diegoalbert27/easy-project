import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('client_wallet')
export class ClientWallet extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column()
  network: string;

  @Column({ name: 'wallet_provider' })
  walletProvider: string;
}
