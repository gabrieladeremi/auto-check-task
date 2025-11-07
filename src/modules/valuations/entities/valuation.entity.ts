import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (v) => v.valuations, {
    onDelete: 'CASCADE',
    eager: true,
  })
  vehicle: Vehicle;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'requested_by' })
  requestedBy?: User;

  @Column('float')
  estimatedValue: number;

  @Column('simple-json', { nullable: true })
  sourceResponse: any;

  @Column({ default: 'mock' })
  source: string;

  @CreateDateColumn()
  fetchedAt: Date;
}
