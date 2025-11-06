import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanApplication } from './entities/loan.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { ValuationsModule } from '../valuations/valuations.module';
import { EligibilityService } from './eligibility.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoanApplication]), ValuationsModule],
  providers: [LoansService, EligibilityService],
  controllers: [LoansController],
})
export class LoansModule {}
