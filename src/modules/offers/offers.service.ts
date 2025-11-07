import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Offer, OfferStatus } from './entities/offer.entity';
import { LoanStatus } from '../loans/entities/loan.entity';
import { LoanApplication } from '../loans/entities/loan.entity';
import { Valuation } from '../valuations/entities/valuation.entity';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(LoanApplication)
    private loanRepo: Repository<LoanApplication>,
    @InjectRepository(Valuation) private valuationRepo: Repository<Valuation>,
    private dataSource: DataSource,
  ) {}

  private calculateMonthly(amount: number, apr: number, months: number) {
    if (apr === 0) return amount / months;
    const r = apr / 100 / 12;
    return (amount * r) / (1 - Math.pow(1 + r, -months));
  }

  private estimateBaseRate(ltv: number) {
    if (ltv <= 0.5) return 8.0;
    if (ltv <= 0.75) return 10.0;
    return 13.0;
  }

  async generateOffers(loanApplicationId: string, maxOffers = 3) {
    const loan = await this.loanRepo.findOne({
      where: { id: loanApplicationId },
      relations: ['vehicle'],
    });

    if (!loan) throw new NotFoundException('Loan application not found');

    const latestVal = await this.valuationRepo.findOne({
      where: { vehicle: { id: loan.vehicle.id } },
      order: { fetchedAt: 'DESC' },
    });

    if (!latestVal)
      throw new BadRequestException('No valuation available for vehicle');

    const estimated = Number(latestVal.estimatedValue);

    const requested = Number(loan.requestedAmount);

    if (requested <= 0)
      throw new BadRequestException('Requested amount must be > 0');

    if (loan.termMonths < 6 || loan.termMonths > 84)
      throw new BadRequestException('Term out of bounds');

    const created: Offer[] = [];

    for (let i = 0; i < Math.min(maxOffers, 5); i++) {
      const fraction = [1, 0.9, 0.75, 0.6, 0.5][i] ?? 0.75;

      let amount = Math.min(requested * fraction, estimated * 0.85); // LTV cap 85%

      amount = Number(amount.toFixed(2));

      const ltv = amount / estimated;

      const baseRate = this.estimateBaseRate(ltv);

      const interest = Number((baseRate + i * 1.2).toFixed(2));

      const monthly = Number(
        this.calculateMonthly(amount, interest, loan.termMonths).toFixed(2),
      );

      const offer = this.offersRepo.create({
        loanApplication: loan,
        amount,
        interestRate: interest,
        monthlyPayment: monthly,
        termMonths: loan.termMonths,
        status: OfferStatus.PENDING,
      });

      await this.offersRepo.save(offer);

      created.push(offer);
    }
    loan.status = LoanStatus.OFFERED; // optional status

    await this.loanRepo.save(loan);

    return created;
  }

  async respondToOffer(
    offerId: string,
    action: 'accept' | 'reject',
    userId: string,
  ) {
    // ensure offer exists and belongs to user's loan
    const offer = await this.offersRepo.findOne({
      where: { id: offerId },
      relations: ['loanApplication'],
    });

    if (!offer) throw new NotFoundException('Offer not found');

    // Authorization should be checked by controller (owner/admin), but double-safety:
    if (offer.loanApplication.applicantId !== userId) {
      throw new BadRequestException('Offer does not belong to this user');
    }

    if (offer.status !== OfferStatus.PENDING)
      throw new BadRequestException('Offer already responded to');

    if (action === 'accept') {
      // Use transaction to atomically accept + reject others + update loan
      await this.dataSource.transaction(async (manager) => {
        offer.status = OfferStatus.ACCEPTED;
        await manager.save(offer);

        await manager
          .createQueryBuilder()
          .update(Offer)
          .set({ status: OfferStatus.REJECTED })
          .where('loan_application_id = :loanId AND id != :id', {
            loanId: offer.loanApplication.id,
            id: offer.id,
          })
          .execute();

        // update loan status
        const loan = await manager.findOne(LoanApplication, {
          where: { id: offer.loanApplication.id },
        });

        loan!.status = LoanStatus.APPROVED;

        loan!.approvedAmount = offer.amount;

        await manager.save(loan);
      });

      return { message: 'Offer accepted', offerId: offer.id };
    } else {
      offer.status = OfferStatus.REJECTED;

      await this.offersRepo.save(offer);

      return { message: 'Offer rejected', offerId: offer.id };
    }
  }

  async getOffersForLoan(loanId: string) {
    return this.offersRepo.find({
      where: { loanApplication: { id: loanId } },
      order: { createdAt: 'DESC' },
    });
  }
}
