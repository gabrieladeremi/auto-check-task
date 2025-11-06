import { Injectable } from '@nestjs/common';
import { Valuation } from '../valuations/entities/valuation.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

/**
 * Eligibility rules are config-driven; for simplicity constants used here.
 * - maxAgeYears: vehicle age beyond which loan is rejected
 * - maxLtv: requested/valuation must be <= this
 * - maxMileage
 */
@Injectable()
export class EligibilityService {
  private maxAgeYears = Number(process.env.MAX_AGE_YEARS || 15);
  private maxLtv = Number(process.env.MAX_LTV || 0.8);
  private maxMileage = Number(process.env.MAX_MILEAGE || 300000);

  check(
    requestedAmount: number,
    valuation: Valuation | null,
    vehicle: Vehicle,
  ) {
    const reasons: string[] = [];
    let eligible = true;

    if (!valuation) {
      reasons.push('no-valuation');
      eligible = false;
    } else {
      const ltv = requestedAmount / valuation.estimatedValue;
      if (ltv > this.maxLtv) {
        reasons.push('ltv-too-high');
        eligible = false;
      }
    }

    const currentYear = new Date().getFullYear();

    if (vehicle.year && currentYear - vehicle.year > this.maxAgeYears) {
      reasons.push('vehicle-too-old');
      eligible = false;
    }

    if (vehicle.mileage && vehicle.mileage > this.maxMileage) {
      reasons.push('mileage-too-high');
      eligible = false;
    }

    const score = eligible ? 100 : 30;
    return { eligible, reasons, score };
  }
}
