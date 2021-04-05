import request from 'supertest';

import { Connection, getRepository } from 'typeorm';
import createConnection from '../../../../../src/database';
import { User } from '../../../../../src/modules/users/entities/User';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../../src/app';
import { sign } from 'jsonwebtoken';

describe('ShowUserProfileController Tests', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM users');
  })

  afterAll(async () => {
    await connection.query('DELETE FROM users');

    await connection.close();
  });

  it('should not be able to show profile when token is not provided', async () => {
    const response = await request(app).get('/api/v1/profile');

    expect(response.status).toBe(401);
  })


  it('should not be able to show profile when invalid token is not provided', async () => {
    const response = await request(app).get('/api/v1/profile').set('Authorization', 'Bearer invalid token');

    expect(response.status).toBe(401);
  })

  it('should not be able to show profile when user not found', async () => {
    const user = {
      id: uuid()
    }

    const token = sign({ user }, 'secret', {
      subject: user.id,
      expiresIn: '1d',
    });

    const response = await request(app).get('/api/v1/profile').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  })

  it('should be able to show profile when user not found', async () => {
    const repository = getRepository(User);

    const user = repository.create({
      id: uuid(),
      name: 'anyname',
      email: 'anymail@mail.com',
      password: '123456'
    })

    await repository.save(user);

    const token = sign({ user }, 'secret', {
      subject: user.id,
      expiresIn: '1d',
    });

    const response = await request(app).get('/api/v1/profile').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString()
    })
  })
})
