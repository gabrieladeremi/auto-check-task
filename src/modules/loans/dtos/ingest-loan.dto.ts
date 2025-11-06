import { IsString, IsInt } from 'class-validator';

export class IngestLoanDto {
  @IsString()
  applicantName: string;

  @IsString()
  applicantEmail: string;

  @IsString()
  vehicleId: string;

  @IsInt()
  requestedAmount: number;
}
