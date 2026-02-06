import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('easy_wallet_recipient')
export class EasyWalletRecipient extends BaseEntity {
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column({ name: 'wallet_provider' })
  walletProvider: string;

  @Column()
  network: string;

  @Column({ name: 'wallet_type' })
  walletType: string;
}
