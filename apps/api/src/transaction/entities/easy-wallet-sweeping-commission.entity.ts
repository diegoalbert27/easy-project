import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('easy_wallet_sweeping_commission')
export class EasyWalletSweepingCommission extends BaseEntity {
  @Column({ name: 'rate_commision', type: 'decimal', precision: 10, scale: 4 })
  rateCommision: string;

  @Column({ name: 'sweeping_commission_type' })
  sweepingCommissionType: string;
}
