import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity()
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (v) => v.valuations, { onDelete: 'CASCADE' })
  vehicle: Vehicle;

  @Column('float')
  estimatedValue: number;

  @Column('simple-json', { nullable: true })
  sourceResponse: any;

  @Column({ default: 'mock' })
  source: string;

  @CreateDateColumn()
  fetchedAt: Date;
}
