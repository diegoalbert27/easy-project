import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('client_wallet_deposit')
export class ClientWalletDeposit extends BaseEntity {
  @Column({ name: 'client_wallet_id' })
  clientWalletId: string;

  @Column({ type: 'decimal', precision: 28, scale: 18 })
  mount: string;

  @Column({ name: 'wallet_address_origin' })
  walletAddressOrigin: string;

  @Column()
  crypto: string;

  @Column({ name: 'deposit_status' })
  depositStatus: string;

  @Column({ name: 'transaction_hash', unique: true })
  transactionHash: string;
}
