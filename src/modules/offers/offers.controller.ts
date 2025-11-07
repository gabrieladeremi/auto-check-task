import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Request,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { GenerateOffersDto } from './dtos/offers.dto';
import { RespondOfferDto } from './dtos/respond-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async generate(@Body() dto: GenerateOffersDto) {
    return this.offersService.generateOffers(
      dto.loanApplicationId,
      dto.maxOffers,
    );
  }

  @Get('by-loan/:loanId')
  @UseGuards(JwtAuthGuard)
  async listForLoan(@Param('loanId') loanId: string) {
    return this.offersService.getOffersForLoan(loanId);
  }

  @Post(':id/respond')
  @UseGuards(JwtAuthGuard)
  async respond(
    @Param('id') id: string,
    @Body() dto: RespondOfferDto,
    @Request() req,
  ) {
    // req.user.userId is available from JwtStrategy.validate
    return this.offersService.respondToOffer(id, dto.action, req.user.userId);
  }
}
