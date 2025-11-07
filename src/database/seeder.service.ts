import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { VehiclesService } from '../modules/vehicles/vehicles.service';
import { ValuationsService } from '../modules/valuations/valuations.service';
import { LoansService } from '../modules/loans/loans.service';
import { OffersService } from '../modules/offers/offers.service';
import { UserRole } from '../modules/users/entities/user.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly vehiclesService: VehiclesService,
    private readonly valuationsService: ValuationsService,
    private readonly loansService: LoansService,
    private readonly offersService: OffersService,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding...');

    // --- USERS ---
    const admin = await this.usersService.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123',
      role: UserRole.ADMIN,
    });

    const user = await this.usersService.create({
      name: 'John Doe',
      email: 'john@demo.com',
      password: 'password123',
      role: UserRole.USER,
    });

    this.logger.log('Users created');

    // --- VEHICLES ---
    const vehicle1 = await this.vehiclesService.ingest({
      vin: '1HGCM82633A004352',
      make: 'Honda',
      model: 'Accord',
      year: 2015,
      mileage: 75000,
    });

    const vehicle2 = await this.vehiclesService.ingest({
      vin: '5FRYD4H66GB592800',
      make: 'Acura',
      model: 'MDX',
      year: 2016,
      mileage: 50000,
    });

    this.logger.log('Vehicles created');

    // --- VALUATIONS ---
    const val1 = await this.valuationsService.fetchAndSave(
      vehicle1.vehicle,
      user,
    );
    const val2 = await this.valuationsService.fetchAndSave(
      vehicle2.vehicle,
      user,
    );

    this.logger.log('Valuations created');

    // --- LOAN APPLICATIONS ---
    const loan1 = await this.loansService.submitApplication(
      {
        applicantName: 'John Doe',
        applicantEmail: 'john@demo.com',
        vehicleId: vehicle1.vehicle.id,
        requestedAmount: val1.estimatedValue * 0.8,
      },
      user.id,
    );

    const loan2 = await this.loansService.submitApplication(
      {
        applicantName: 'John Doe',
        applicantEmail: 'john@demo.com',
        vehicleId: vehicle2.vehicle.id,
        requestedAmount: val2.estimatedValue * 0.9,
      },
      user.id,
    );

    this.logger.log('Loan applications created');

    // --- OFFERS ---
    await this.offersService.generateOffers(loan1.id);

    await this.offersService.generateOffers(loan2.id);

    this.logger.log('Offers created');

    this.logger.log('Seeding complete!');
  }
}
