import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class LoanApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicantName: string;

  @Column()
  applicantEmail: string;

  @ManyToOne(() => Vehicle, { eager: true })
  vehicle: Vehicle;

  @Column('float')
  requestedAmount: number;

  @Column('float', { nullable: true })
  approvedAmount: number;

  @Column({ type: 'text', nullable: true })
  eligibilityFactors: string;

  @Column({ type: 'varchar', default: LoanStatus.PENDING })
  status: LoanStatus;

  @Column({ default: false })
  isLiquidated: boolean;

  @Column('float', { default: 0 })
  amountRepaid: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
