import request from 'supertest';

import { Connection, getRepository } from 'typeorm';
import createConnection from '../../../../../src/database';
import { User } from '../../../../../src/modules/users/entities/User';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../../src/app';
import { sign } from 'jsonwebtoken';
import { Statement } from '../../../../../src/modules/statements/entities/Statement';

describe('CreateStatementController Tests', () => {
  let connection: Connection;
  let user: User;
  let token: string;

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    await connection.query('DELETE FROM users');

    const repository = getRepository(User);

    user = repository.create({
      id: uuid(),
      name: 'anyname',
      email: 'anymail@mail.com',
      password: '123456'
    })

    await repository.save(user);

    token = sign({ user }, 'secret', {
      subject: user.id,
      expiresIn: '1d',
    });
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM statements');
  })

  afterAll(async () => {
    await connection.query('DELETE FROM statements');
    await connection.query('DELETE FROM users');

    await connection.close();
  });

  it('should not be able to create statement if token is not provided', async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 10,
      description: 'anydesc'
    });

    expect(response.status).toBe(401);
  })


  it('should not be able to create statement if user doest not exists', async () => {
    const fakeToken = sign({}, 'secret', {
      subject: uuid(),
      expiresIn: '1d',
    });

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({
        amount: 10,
        description: 'anydesc'
      })

    expect(response.status).toBe(404);
  })

  it('should be able to create statement a deposit statement', async () => {
    const body = {
      amount: 10,
      description: 'anydesc'
    }

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('deposit')
    expect(response.body.amount).toBe(body.amount);
    expect(response.body.description).toBe(body.description);
  })

  it('should be able to create statement a withdraw statement', async () => {
    const repository = getRepository(Statement);

    const statement = repository.create({
      amount: 10,
      description: 'anydesc',
      user_id: user.id as string,
      type: 'deposit' as any,
      id: uuid()
    })

    await repository.save(statement);

    const body = {
      amount: 10,
      description: 'anydesc'
    }

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('withdraw')
    expect(response.body.amount).toBe(body.amount);
    expect(response.body.description).toBe(body.description);
  })

  it('should not be able to create statement a withdraw with no funds', async () => {
    const body = {
      amount: 10,
      description: 'anydesc'
    }

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(400);
  })
})
