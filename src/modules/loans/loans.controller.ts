import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanStatus } from './entities/loan.entity';
import { IngestLoanDto } from './dtos/ingest-loan.dto';

@Controller('api/v1/loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post()
  async submit(@Body() body: IngestLoanDto) {
    return this.loansService.submitApplication(body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.loansService.getLoan(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: LoanStatus },
  ) {
    return this.loansService.updateStatus(id, body.status);
  }
}
