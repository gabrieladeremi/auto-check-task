import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('LoanModule (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let vehicleId: string;
  const uniqueEmail = `loaner+${Date.now()}@yopmail.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      name: 'Loan User',
      email: uniqueEmail,
      password: 'password',
    });

    const signin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail, password: 'password' });

    token = signin.body.token;

    const vehicle = await request(app.getHttpServer())
      .post('/api/v1/vehicles/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vin: `VIN-${Date.now()}`,
        make: 'Honda',
        model: 'Accord',
        year: 2020,
        mileage: 20000,
      });

    vehicleId = vehicle.body.vehicle.id;
  });

  it('should create a loan application', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: `Loan User`,
        applicantEmail: uniqueEmail,
        vehicleId,
        requestedAmount: 5000,
      })
      .expect(201);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('vehicle');
    expect(response.body.status).toBe('pending');
    expect(response.body.vehicle.id).toBe(vehicleId);
    expect(response.body.requestedAmount).toBe(5000);
  });

  it('should not allow a user to apply for a new loan when an existing one is active', async () => {
    const applicantEmail = `duplicate+${Date.now()}@yopmail.com`;

    await request(app.getHttpServer())
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: 'John Doe',
        applicantEmail,
        vehicleId,
        requestedAmount: 6000.0,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: 'John Doe',
        applicantEmail,
        vehicleId,
        requestedAmount: 8000.0,
      })
      .expect(400);

    expect(response.body.message).toContain('must be resolved before applying');
  });

  afterAll(async () => {
    await app.close();
  });
});
