import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Valuation } from '../../valuations/entities/valuation.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  vin: string;

  @Column({ nullable: true })
  make: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true, type: 'int' })
  year: number;

  @Column({ nullable: true, type: 'int' })
  mileage: number;

  @OneToMany(() => Valuation, (v) => v.vehicle)
  valuations: Valuation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
