import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('easy_wallet_transaction')
export class EasyWalletTransaction extends BaseEntity {
  @Column({ type: 'decimal', precision: 28, scale: 18 })
  mount: string;

  @Column({ name: 'wallet_address_origin' })
  walletAddressOrigin: string;

  @Column({ name: 'wallet_address_destination' })
  walletAddressDestination: string;

  @Column({ name: 'transaction_type' })
  transactionType: string;

  @Column()
  crypto: string;

  @Column({ name: 'sweeping_commission', type: 'decimal', precision: 28, scale: 18 })
  sweepingCommission: string;

  @Column({ name: 'transaction_hash', unique: true, nullable: true })
  transactionHash?: string;
}
