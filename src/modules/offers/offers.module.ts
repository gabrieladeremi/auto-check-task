import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from './entities/offer.entity';
import { LoanApplication } from '../loans/entities/loan.entity';
import { Valuation } from '../valuations/entities/valuation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, LoanApplication, Valuation])],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
