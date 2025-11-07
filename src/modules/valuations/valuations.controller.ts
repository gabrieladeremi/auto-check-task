import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ValuationsService } from './valuations.service';
import { UsersService } from '../users/users.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ValuationProvider } from '../../integrations/valuation.provider';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/valuations')
export class ValuationsController {
  constructor(
    private valuationsService: ValuationsService,
    private vehiclesService: VehiclesService,
    private usersService: UsersService,
    private valuationProvider: ValuationProvider,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: { vin?: string; vehicleId?: string },
    @CurrentUser() user,
  ) {
    const { vin, vehicleId } = body;

    const authUser = await this.usersService.findById(user.userId);

    if (!authUser) {
      throw new NotFoundException('User not found.');
    }

    let vehicle;

    if (vehicleId) {
      vehicle = await this.vehiclesService.findById(vehicleId);
    } else if (vin) {
      vehicle = await this.vehiclesService.findByVin(vin);
    }

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    return this.valuationsService.fetchAndSave(vehicle, authUser);
  }

  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  async latest(@Param('vehicleId') vehicleId: string) {
    return this.valuationsService.getLatestValuationForVehicle(vehicleId);
  }

  @Get('validate/:vin')
  async validate(@Param('vin') vin: string) {
    return this.valuationProvider.lookupByVin(vin);
  }
}
