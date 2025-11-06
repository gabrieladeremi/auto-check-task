import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ValuationsService } from './valuations.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ValuationProvider } from '../../integrations/valuation.provider';

@Controller('api/v1/valuations')
export class ValuationsController {
  constructor(
    private valuationsService: ValuationsService,
    private vehiclesService: VehiclesService,
    private valuationProvider: ValuationProvider,
  ) {}

  @Post()
  async create(@Body() body: { vin?: string; vehicleId?: string }) {
    const { vin, vehicleId } = body;

    let vehicle;

    if (vehicleId) {
      vehicle = await this.vehiclesService.findById(vehicleId);
    } else if (vin) {
      vehicle = await this.vehiclesService.findByVin(vin);
    }

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    return this.valuationsService.fetchAndSave(vehicle);
  }

  @Get('vehicle/:vehicleId')
  async latest(@Param('vehicleId') vehicleId: string) {
    return this.valuationsService.getLatestValuationForVehicle(vehicleId);
  }

  @Get('validate/:vin')
  async validate(@Param('vin') vin: string) {
    return this.valuationProvider.lookupByVin(vin);
  }
}
