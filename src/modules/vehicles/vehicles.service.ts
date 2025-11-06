import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { ValuationsService } from '../valuations/valuations.service';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle) private vehiclesRepo: Repository<Vehicle>,
    private valuationsService: ValuationsService,
  ) {}

  async ingest(dto: Partial<Vehicle>, fetchValuation = true) {
    let vehicle = await this.vehiclesRepo.findOne({ where: { vin: dto.vin } });
    if (!vehicle) {
      vehicle = this.vehiclesRepo.create(dto as Vehicle);
      await this.vehiclesRepo.save(vehicle);
    } else {
      Object.assign(vehicle, dto);
      await this.vehiclesRepo.save(vehicle);
    }

    if (fetchValuation) {
      try {
        await this.valuationsService.fetchAndSave(vehicle);
      } catch (err) {
        this.logger.warn(
          `Valuation fetch failed for VIN ${vehicle.vin}: ${err.message}`,
        );
      }
    }

    const latest = await this.valuationsService.getLatestValuationForVehicle(
      vehicle.id,
    );
    return { vehicle, latestValuation: latest };
  }

  async findById(id: string) {
    return this.vehiclesRepo.findOne({ where: { id } });
  }

  async findByVin(vin: string) {
    return this.vehiclesRepo.findOne({ where: { vin } });
  }
}
