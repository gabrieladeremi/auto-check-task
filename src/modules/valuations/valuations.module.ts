import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Valuation } from './entities/valuation.entity';
import { ValuationsService } from './valuations.service';
import { ValuationsController } from './valuations.controller';
import { ValuationProvider } from '../../integrations/valuation.provider';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Valuation]),
    forwardRef(() => VehiclesModule),
    forwardRef(() => UsersModule),
  ],
  providers: [ValuationsService, ValuationProvider],
  controllers: [ValuationsController],
  exports: [ValuationsService],
})
export class ValuationsModule {}
