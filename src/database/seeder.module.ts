import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Valuation } from '../modules/valuations/entities/valuation.entity';
import { LoanApplication } from '../modules/loans/entities/loan.entity';
import { Offer } from '../modules/offers/entities/offer.entity';
import { SeederService } from './seeder.service';

// ✅ Import the modules, not services
import { UsersModule } from '../modules/users/users.module';
import { VehiclesModule } from '../modules/vehicles/vehicles.module';
import { ValuationsModule } from '../modules/valuations/valuations.module';
import { LoansModule } from '../modules/loans/loans.module';
import { OffersModule } from '../modules/offers/offers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Vehicle,
      Valuation,
      LoanApplication,
      Offer,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => VehiclesModule),
    forwardRef(() => ValuationsModule),
    forwardRef(() => LoansModule),
    forwardRef(() => OffersModule),
  ],
  providers: [SeederService],
})
export class SeederModule {}
