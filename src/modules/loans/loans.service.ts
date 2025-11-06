import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanApplication, LoanStatus } from './entities/loan.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ValuationsService } from '../valuations/valuations.service';
import { EligibilityService } from './eligibility.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanApplication)
    private loansRepo: Repository<LoanApplication>,
    private valuationsService: ValuationsService,
    private eligibilityService: EligibilityService,
  ) {}

  async submitApplication(payload: {
    applicantName: string;
    applicantEmail: string;
    vehicleId: string;
    requestedAmount: number;
  }) {
    const { applicantName, applicantEmail, vehicleId, requestedAmount } =
      payload;

    if (!applicantName || !applicantEmail || !vehicleId || !requestedAmount) {
      throw new BadRequestException('missing required fields');
    }

    const valuation =
      await this.valuationsService.getLatestValuationForVehicle(vehicleId);

    const vehicle =
      valuation?.vehicle ||
      (await this.valuationsService['valuationsRepo'].manager
        .getRepository(Vehicle)
        .findOne({ where: { id: vehicleId } }));

    if (!vehicle) throw new BadRequestException('vehicle not found');

    const eligibility = this.eligibilityService.check(
      requestedAmount,
      valuation || null,
      vehicle,
    );

    const existingLoan = await this.loansRepo.findOne({
      where: [
        { applicantEmail, status: LoanStatus.PENDING },
        { applicantEmail, status: LoanStatus.APPROVED, isLiquidated: false },
      ],
    });

    if (existingLoan) {
      throw new BadRequestException(
        `You already have a ${existingLoan.status} loan that must be resolved before applying for a new one.`,
      );
    }

    const loan = this.loansRepo.create({
      applicantName,
      applicantEmail,
      vehicle,
      requestedAmount,
      approvedAmount: eligibility.eligible
        ? Math.min(requestedAmount, valuation?.estimatedValue || 0)
        : 0,
      eligibilityFactors: JSON.stringify(eligibility),
      status: eligibility.eligible ? LoanStatus.PENDING : LoanStatus.REJECTED,
    });

    await this.loansRepo.save(loan);

    return loan;
  }

  async getLoan(id: string) {
    return this.loansRepo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: LoanStatus) {
    const loan = await this.getLoan(id);

    if (!loan) throw new BadRequestException('loan not found');

    loan.status = status;

    await this.loansRepo.save(loan);

    return loan;
  }
}
