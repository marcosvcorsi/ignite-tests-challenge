import request from 'supertest';

import { Connection, getRepository } from 'typeorm';
import createConnection from '../../../../../src/database';
import { User } from '../../../../../src/modules/users/entities/User';
import { v4 as uuid } from 'uuid';
import { hash } from 'bcryptjs';
import { app } from '../../../../../src/app';

describe('AuthenticateUserController Tests', () => {
  let connection: Connection;
  let user: User;

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    await connection.query('DELETE FROM users');

    const repository = getRepository(User);

    const id = uuid();
    const password = await hash('123456', 8);

    user = repository.create({
      id,
      name: 'anyname',
      email: 'anymail@mail.com',
      password,
    })

    await repository.save(user);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be able to authenticate user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: '123456'
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  })

  it('should not be able to authenticate user with invalid email', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'invalid-email@mail.com',
      password: '123456'
    });

    expect(response.status).toBe(401);
  })

  it('should not be able to authenticate user with invalid password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: '1234567'
    });

    expect(response.status).toBe(401);
  })
})
