import request from 'supertest';

import { Connection, getRepository } from 'typeorm';
import createConnection from '../../../../../src/database';
import { User } from '../../../../../src/modules/users/entities/User';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../../src/app';
import { sign } from 'jsonwebtoken';
import { Statement } from '../../../../../src/modules/statements/entities/Statement';

describe('CreateTransferStatementsController', () => {
  let connection: Connection;
  let user: User;
  let receiver: User;
  let token: string;

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    await connection.query('DELETE FROM statements');
    await connection.query('DELETE FROM users');

    const repository = getRepository(User);

    user = repository.create({
      id: uuid(),
      name: 'anyname',
      email: 'anymail@mail.com',
      password: '123456'
    })

    receiver = repository.create({
      id: uuid(),
      name: 'anyname2',
      email: 'anymail2@mail.com',
      password: '123456'
    })

    await repository.save(user);
    await repository.save(receiver);

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
    const response = await request(app).post('/api/v1/statements/transfers/anyid').send({
      amount: 10,
      description: 'anydesc'
    });

    expect(response.status).toBe(401);
  })


  it('should not be able to create statement if user does not exists', async () => {
    const fakeToken = sign({}, 'secret', {
      subject: uuid(),
      expiresIn: '1d',
    });

    const response = await request(app)
      .post('/api/v1/statements/transfers')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({
        amount: 10,
        description: 'anydesc'
      })

    expect(response.status).toBe(404);
  })

  it('should not be able to create transfer statements when amount is invalid', async () => {
    const body = {
      amount: -10,
      description: 'anydesc'
    }

    const response = await request(app)
      .post('/api/v1/statements/transfers/anyid')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(400);
  })

  it('should not be able to create transfer statements when receiver does not exists', async () => {
    const body = {
      amount: 10,
      description: 'anydesc'
    }

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${uuid()}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(404);
  })

  it('should not be able to create transfer statements when sender has insufficient funds', async () => {
    const body = {
      amount: 10,
      description: 'anydesc'
    }

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${receiver.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(400);
  })

  it('should be able to create transfer statements', async () => {
    const statementsRepository = getRepository(Statement);

    const statement = statementsRepository.create({
      amount: 50,
      description: 'anydesc',
      user_id: user.id as string,
      type: 'deposit' as any,
      id: uuid()
    })

    await statementsRepository.save(statement);

    const body = {
      amount: 10,
      description: 'anydesc'
    }

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${receiver.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty('senderStatement');
    expect(response.body).toHaveProperty('receiverStatement');
  })
})
