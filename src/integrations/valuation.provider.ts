import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * ValuationProvider:
 * - If RAPIDAPI_KEY/RAPIDAPI_HOST provided, attempts an HTTP lookup (example structure)
 * - Otherwise, falls back to a deterministic mock valuation using year & mileage
 */
@Injectable()
export class ValuationProvider {
  private readonly logger = new Logger(ValuationProvider.name);
  private readonly rapidKey = process.env.RAPIDAPI_KEY;
  private readonly rapidHost = process.env.RAPIDAPI_HOST;

  async lookupByVin(
    vin: string,
    vehicle?: any,
  ): Promise<{ estimatedValue: number; raw: any; source: string }> {
    if (this.rapidKey && this.rapidHost) {
      try {
        const url = `https://vin-lookup2.p.rapidapi.com/vehicle-lookup?vin=${vin}`;

        const res = await axios.get(url, {
          headers: {
            'x-rapidapi-key':
              'a56bca4175mshfb1e14732487c6cp12a21cjsnd4359e37a1ce',
            'x-rapidapi-host': 'vin-lookup2.p.rapidapi.com',
          },
          timeout: 5000,
        });

        if (!res.data) throw new Error('No data returned from RapidAPI.');

        const mapped = this.mapRapidApiResponse(res.data, vehicle);

        return {
          estimatedValue: mapped,
          raw: res.data,
          source: 'rapidapi',
        };
      } catch (err) {
        this.logger.warn(
          `RapidAPI lookup failed: ${err.message}. Falling back to mock valuation.`,
        );
      }
    }

    const mockValue = this.mockValuation(vehicle);

    return {
      estimatedValue: mockValue,
      raw: { mock: true, vin },
      source: 'mock',
    };
  }

  private mockValuation(vehicle?: any): number {
    // crude formula: base depending on year, reduce by mileage
    const currentYear = new Date().getFullYear();
    const year = vehicle?.year || currentYear;
    const mileage = vehicle?.mileage || 50000;
    const age = Math.max(0, currentYear - year);
    const base = 30000; // base
    const estimated = Math.max(
      1000,
      base * Math.max(0.2, 1 - age * 0.07) - (mileage / 1000) * 200,
    );
    return Math.round(estimated);
  }

  private mapRapidApiResponse(data: any, vehicle?: any) {
    // implement mapping based on provider; placeholder:
    // try to extract marketValue, tradeInValue etc.
    if (!data) return this.mockValuation(vehicle);
    const possible =
      data.marketValue ||
      data.estimated_value ||
      data.valuation ||
      (data.price && data.price.estimated) ||
      null;
    return Number(possible) || this.mockValuation(vehicle);
  }
}
