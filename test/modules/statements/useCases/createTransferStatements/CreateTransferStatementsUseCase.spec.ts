import { OperationType } from "../../../../../src/modules/statements/entities/Statement";
import { IStatementsRepository } from "../../../../../src/modules/statements/repositories/IStatementsRepository";
import { CreateTransferStatementsError } from "../../../../../src/modules/statements/useCases/createTransferStatements/CreateTransferStatementsError";
import { CreateTransferStatementsUseCase } from "../../../../../src/modules/statements/useCases/createTransferStatements/CreateTransferStatementsUseCase";
import { IUsersRepository } from "../../../../../src/modules/users/repositories/IUsersRepository";
import { UsersRepositoryInMemory } from "../../../users/repositories/UsersRepositoryInMemory";
import { StatementsRepositoryInMemory } from "../../repositories/StatementsRepositoryInMemory";

describe('CreateTransferStatementsUseCase Tests', () => {
  let createTransferStatementsUseCase: CreateTransferStatementsUseCase;
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;

  beforeEach(() => {
    usersRepository = new UsersRepositoryInMemory();
    statementsRepository = new StatementsRepositoryInMemory();

    createTransferStatementsUseCase = new CreateTransferStatementsUseCase(
      usersRepository,
      statementsRepository
    )
  })

  it('should not be able to create transfer statements when amount is invalid', async () => {
    await expect(createTransferStatementsUseCase.execute({
      sender_id: 'anysenderid',
      receiver_id: 'anyreceiverid',
      amount: -10,
      description: 'anydesc'
    })).rejects.toBeInstanceOf(CreateTransferStatementsError.InvalidAmount);
  })

  it('should not be able to create transfer statements when sender does not exists', async () => {
    await expect(createTransferStatementsUseCase.execute({
      sender_id: 'anysenderid',
      receiver_id: 'anyreceiverid',
      amount: 100,
      description: 'anydesc'
    })).rejects.toBeInstanceOf(CreateTransferStatementsError.SenderNotFound);
  })

  it('should not be able to create transfer statements when receiver does not exists', async () => {
    const sender = await usersRepository.create({
      name: 'anysender',
      email: 'anysender@mail.com',
      password: '123456'
    })

    await expect(createTransferStatementsUseCase.execute({
      sender_id: sender.id as string,
      receiver_id: 'anyreceiverid',
      amount: 100,
      description: 'anydesc'
    })).rejects.toBeInstanceOf(CreateTransferStatementsError.ReceiverNotFound);
  })

  it('should not be able to create transfer statements when sender has insufficient funds', async () => {
    const sender = await usersRepository.create({
      name: 'anysender',
      email: 'anysender@mail.com',
      password: '123456'
    })

    const receiver = await usersRepository.create({
      name: 'anyreceiver',
      email: 'anyreceiver@mail.com',
      password: '123456'
    })

    await expect(createTransferStatementsUseCase.execute({
      sender_id: sender.id as string,
      receiver_id: receiver.id as string,
      amount: 100,
      description: 'anydesc'
    })).rejects.toBeInstanceOf(CreateTransferStatementsError.InsufficientFunds);
  })

  it('should be able to create transfer statements', async () => {
    const sender = await usersRepository.create({
      name: 'anysender',
      email: 'anysender@mail.com',
      password: '123456'
    })

    const receiver = await usersRepository.create({
      name: 'anyreceiver',
      email: 'anyreceiver@mail.com',
      password: '123456'
    });

    await statementsRepository.create({
      amount: 150,
      description: 'anydesc',
      user_id: sender.id as string,
      type: OperationType.DEPOSIT
    })

    const amount = 100;
    const description = 'anydesc';

    const response = await createTransferStatementsUseCase.execute({
      sender_id: sender.id as string,
      receiver_id: receiver.id as string,
      amount,
      description,
    })

    expect(response).toBeDefined();
    expect(response.senderStatement.receiver_id).toBe(receiver.id);
    expect(response.receiverStatement.sender_id).toBe(sender.id);
    expect(response.senderStatement.amount).toBe(-Math.abs(amount));
    expect(response.receiverStatement.amount).toBe(amount);
  })
})
