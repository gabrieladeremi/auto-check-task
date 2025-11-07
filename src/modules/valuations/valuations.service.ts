import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Valuation } from './entities/valuation.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ValuationProvider } from '../../integrations/valuation.provider';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ValuationsService {
  constructor(
    @InjectRepository(Valuation) private valuationsRepo: Repository<Valuation>,
    private valuationProvider: ValuationProvider,
  ) {}

  async fetchAndSave(vehicle: Vehicle, user?: User | null) {
    const last = await this.valuationsRepo.findOne({
      where: {
        vehicle: { id: vehicle.id } as any,
        requestedBy: { id: user?.id },
      },
      order: { fetchedAt: 'DESC' },
    });

    const now = Date.now();

    if (
      last &&
      now - new Date(last.fetchedAt).getTime() < 24 * 60 * 60 * 1000
    ) {
      return last;
    }

    const res = await this.valuationProvider.lookupByVin(vehicle.vin, vehicle);

    const valuation = this.valuationsRepo.create({
      vehicle: vehicle,
      requestedBy: user!,
      estimatedValue: res.estimatedValue,
      sourceResponse: res.raw,
      source: res.source,
    });
    await this.valuationsRepo.save(valuation);

    return valuation;
  }

  async getLatestValuationForVehicle(vehicleId: string) {
    return this.valuationsRepo.findOne({
      where: { vehicle: { id: vehicleId } as any },
      order: { fetchedAt: 'DESC' },
    });
  }
}
