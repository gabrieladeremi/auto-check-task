import { IsEnum } from 'class-validator';

export class RespondOfferDto {
  @IsEnum(['accept', 'reject' as any])
  action: 'accept' | 'reject';
}
