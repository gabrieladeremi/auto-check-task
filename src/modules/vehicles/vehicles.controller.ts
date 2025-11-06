import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { IngestVehicleDto } from './dtos/ingest-vehicle.dto';

@Controller('api/v1/vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post('ingest')
  async ingest(@Body() body: IngestVehicleDto) {
    const fetch = body.fetchValuation !== false;
    return this.vehiclesService.ingest(body as any, fetch);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @Get()
  async getByVin(@Query('vin') vin?: string) {
    if (!vin) return { error: 'provide vin query param' };
    return this.vehiclesService.findByVin(vin);
  }
}
