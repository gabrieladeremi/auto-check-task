import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ValuationModule (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let vehicleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'valuer@yopmail.com',
      password: 'password',
    });

    const signin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'valuer@yopmail.com', password: 'password' });

    token = signin.body.token;

    const response = await request(app.getHttpServer())
      .post('/api/v1/vehicles/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vin: 'VIN123',
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        mileage: 15000,
      });

    vehicleId = response.body.vehicle.id;
    vehicleVin = response.body.vehicle.vin;
  });

  it('should create a valuation request', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/valuations`)
      .send({ vin: vehicleVin })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body).toHaveProperty('estimatedValue');
    expect(response.body).toHaveProperty('requestedBy');
    expect(response.body).toHaveProperty('sourceResponse');
    expect(response.body.vehicle.id).toBe(vehicleId);
  });

  afterAll(async () => {
    await app.close();
  });
});
