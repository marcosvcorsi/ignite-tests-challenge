import request from 'supertest';

import { Connection, getRepository } from 'typeorm';
import createConnection from '../../../../../src/database';
import { User } from '../../../../../src/modules/users/entities/User';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../../src/app';
import { sign } from 'jsonwebtoken';
import { Statement } from '../../../../../src/modules/statements/entities/Statement';

describe('GetBalanceController Tests', () => {
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

  it('should not be able to get balance if token is not provided', async () => {
    const response = await request(app).get('/api/v1/statements/balance');

    expect(response.status).toBe(401);
  })


  it('should not be able to get balance if user doest not exists', async () => {
    const fakeToken = sign({}, 'secret', {
      subject: uuid(),
      expiresIn: '1d',
    });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(404);
  })

  it('should be able to get balance', async () => {
    const repository = getRepository(Statement);

    const statement1 = repository.create({
      amount: 100,
      description: 'anydesc',
      user_id: user.id as string,
      type: 'deposit' as any,
      id: uuid()
    })

    const statement2 = repository.create({
      amount: 50,
      description: 'anydesc',
      user_id: user.id as string,
      type: 'withdraw' as any,
      id: uuid()
    })

    await repository.save([statement1, statement2]);

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(50);
    expect(response.body.statement).toHaveLength(2);
  })
})
