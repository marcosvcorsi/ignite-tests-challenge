import request from 'supertest';

import { Connection, getRepository } from 'typeorm';
import createConnection from '../../../../../src/database';
import { User } from '../../../../../src/modules/users/entities/User';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../../src/app';

describe('CreateUserController Tests', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users');
  })

  afterAll(async () => {
    await connection.close();
  });

  it('should be able to create a user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'anyname',
      email: 'anymail@mail.com',
      password: '123456'
    })

    expect(response.status).toBe(201);
  })

  it('should not be able to create a user when e-mail already exists', async () => {
    const repository = getRepository(User);

    const user = repository.create({
      id: uuid(),
      name: 'anyname',
      email: 'anymail@mail.com',
      password: '123456'
    })

    await repository.save(user);

    const response = await request(app).post('/api/v1/users').send({
      name: 'anyname',
      email: 'anymail@mail.com',
      password: '123456'
    })

    expect(response.status).toBe(400);
  })
})
