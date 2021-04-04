import { IStatementsRepository } from "../../../../../src/modules/statements/repositories/IStatementsRepository";
import { CreateStatementError } from "../../../../../src/modules/statements/useCases/createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../../../../../src/modules/statements/useCases/createStatement/CreateStatementUseCase"
import { IUsersRepository } from "../../../../../src/modules/users/repositories/IUsersRepository";
import { UsersRepositoryInMemory } from "../../../users/repositories/UsersRepositoryInMemory";
import { StatementsRepositoryInMemory } from "../../repositories/StatementsRepositoryInMemory";

describe('CreateStatementUseCase Tests', () => {
  let createStatementUseCase: CreateStatementUseCase;
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;

  beforeEach(() => {
    usersRepository = new UsersRepositoryInMemory();
    statementsRepository = new StatementsRepositoryInMemory();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  })

  it('should be able to create a deposit statement', async () => {
    const user =  await usersRepository.create({
      email: 'anymail@mail.com',
      password: 'anypassword',
      name: 'anyname'
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'anydeposit'
    })

    expect(statement).toBeDefined();
    expect(statement.type).toBe('deposit');
    expect(statement.amount).toBe(10)
  })

  it('should be able to create a withdraw statement', async () => {
    const user =  await usersRepository.create({
      email: 'anymail@mail.com',
      password: 'anypassword',
      name: 'anyname'
    })

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'deposit' as any,
      amount: 10,
      description: 'anydeposit'
    })


    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'withdraw' as any,
      amount: 10,
      description: 'anywithdraw'
    })

    expect(statement).toBeDefined()
    expect(statement.type).toBe('withdraw');
    expect(statement.amount).toBe(10)
  })

  it('should not be able to create a statement with invalid user', async () => {
    expect(createStatementUseCase.execute({
      user_id: 'anyinvalidid',
      type: 'deposit' as any,
      amount: 10,
      description: 'anydeposit'
    })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it('should not be able to create a withdraw statement without funds', async () => {
    const user =  await usersRepository.create({
      email: 'anymail@mail.com',
      password: 'anypassword',
      name: 'anyname'
    })

    expect(createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'withdraw' as any,
      amount: 10,
      description: 'anywithdraw'
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})
