import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OfferModule (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let loanId: string;
  const uniqueEmail = `loaner+${Date.now()}@yopmail.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      name: 'Offer Admin',
      email: 'offeradmin@yopmail.com',
      password: 'password',
      role: 'admin',
    });

    const signin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'offeradmin@yopmail.com', password: 'password' });

    token = signin.body.token;

    const vehicle = await request(app.getHttpServer())
      .post('/api/v1/vehicles/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vin: `OFFER-${Date.now()}`,
        make: 'BMW',
        model: 'X5',
        year: 2020,
        mileage: 12000,
      });

    vehicleId = vehicle.body.vehicle.id;
  });

  it('should create a loan offer', async () => {
    const loan = await request(app.getHttpServer())
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: `Loan User`,
        applicantEmail: uniqueEmail,
        vehicleId,
        requestedAmount: 5000,
      });

    loanId = loan.body.id;

    const response = await request(app.getHttpServer())
      .post('/api/v1/offers/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        loanId,
      })
      .expect(201);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const offer = response.body[0];
    expect(offer).toHaveProperty('interestRate');
    expect(offer).toHaveProperty('termMonths');
    expect(offer).toHaveProperty('loanApplication');
    expect(offer.loanApplication).toHaveProperty('vehicle');
  });

  it('should fail to create a loan offer when a loan already exists', async () => {
    const applicantEmail = `duplicate+${Date.now()}@yopmail.com`;

    await request(app.getHttpServer())
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: `Loan User`,
        applicantEmail,
        vehicleId,
        requestedAmount: 5000,
      })
      .expect(201);

    const loan = await request(app.getHttpServer())
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: `Loan User`,
        applicantEmail,
        vehicleId,
        requestedAmount: 5000,
      })
      .expect(400);

    expect(loan.body.message).toContain(
      'You already have a pending loan that must be resolved before applying for a new one.',
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
