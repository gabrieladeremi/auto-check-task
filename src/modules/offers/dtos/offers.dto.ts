import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GenerateOffersDto {
  @IsString()
  loanApplicationId: string;

  @IsOptional()
  @IsNumber()
  maxOffers?: number = 3;
}
