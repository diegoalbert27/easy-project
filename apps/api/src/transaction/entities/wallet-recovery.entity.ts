import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('wallet_recovery')
export class WalletRecovery extends BaseEntity {
  @Column({ name: 'wallet_address', unique: true })
  walletAddress: string;

  @Column({ name: 'private_key', type: 'text' })
  privateKey: string;

  @Column({ type: 'text' })
  phrase: string;

  @Column({ name: 'wallet_type' })
  walletType: string;
}
