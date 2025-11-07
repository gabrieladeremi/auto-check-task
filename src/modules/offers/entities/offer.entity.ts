// src/modules/offers/entities/offer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { LoanApplication } from '../../loans/entities/loan.entity';

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'offers' })
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LoanApplication, (la) => la.offers, { eager: true })
  @JoinColumn({ name: 'loan_application_id' })
  loanApplication: LoanApplication;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 5, scale: 2 })
  interestRate: number;

  @Column('decimal', { precision: 12, scale: 2 })
  monthlyPayment: number;

  @Column('int')
  termMonths: number;

  @Column({ type: 'varchar', default: OfferStatus.PENDING })
  status: OfferStatus;

  @CreateDateColumn()
  createdAt: Date;
}
