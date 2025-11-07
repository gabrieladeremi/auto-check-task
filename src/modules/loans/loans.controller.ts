import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanStatus } from './entities/loan.entity';
import { IngestLoanDto } from './dtos/ingest-loan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('api/v1/loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async submit(@Body() body: IngestLoanDto, @CurrentUser() user) {
    return this.loansService.submitApplication(body, user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id') id: string) {
    return this.loansService.getLoan(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: LoanStatus },
  ) {
    return this.loansService.updateStatus(id, body.status);
  }
}
