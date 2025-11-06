import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ValuationsModule } from './modules/valuations/valuations.module';
import { LoansModule } from './modules/loans/loans.module';
import { Vehicle } from './modules/vehicles/entities/vehicle.entity';
import { Valuation } from './modules/valuations/entities/valuation.entity';
import { LoanApplication } from './modules/loans/entities/loan.entity';
import { ValuationProvider } from './integrations/valuation.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      synchronize: true,
      logging: false,
      entities: [LoanApplication, User, Vehicle, Valuation],
    }),
    AuthModule,
    VehiclesModule,
    ValuationsModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService, ValuationProvider],
})
export class AppModule {}
