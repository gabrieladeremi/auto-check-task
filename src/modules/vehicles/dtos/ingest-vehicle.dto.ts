import { IsString, IsOptional, IsInt, Min, Max, Length } from 'class-validator';

export class IngestVehicleDto {
  @IsString()
  @Length(3, 50)
  vin: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1886)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @IsOptional()
  @IsInt()
  mileage?: number;

  @IsOptional()
  fetchValuation?: boolean;
}
