import { IsOptional, IsUUID, IsString } from 'class-validator';

export class CreateValuationDto {
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  vin?: string;
}
