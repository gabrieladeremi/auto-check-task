import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';

export enum LoanStatus {
  APPROVED = 'approved',
  OFFERED = 'offered',
  PENDING = 'pending',
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

  @ManyToOne(() => User, { eager: true })
  applicant: User;

  @Column({ nullable: true })
  applicantId: string;

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

  @Column({ type: 'int', default: 12 })
  termMonths: number;

  @Column('float', { default: 0 })
  amountRepaid: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @OneToMany(() => Offer, (o) => o.loanApplication)
  offers: Offer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
