import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('VehicleModule (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@yopmail.com',
      password: 'password',
    });

    const signin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@yopmail.com', password: 'password' });

    token = signin.body.access_token;
  });

  it('should create a vehicle', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vehicles/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vin: '1HGCM82633A004352',
        make: 'Honda',
        model: 'Accord',
        year: 2020,
        mileage: 20000,
      })
      .expect(201);

    expect(response.body.vehicle).toHaveProperty('id');
    expect(response.body.vehicle.make).toBe('Honda');
    expect(response.body.vehicle.model).toBe('Accord');
  });

  afterAll(async () => {
    await app.close();
  });
});
