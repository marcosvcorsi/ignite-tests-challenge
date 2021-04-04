import { IStatementsRepository } from "../../../../../src/modules/statements/repositories/IStatementsRepository";
import { GetBalanceError } from "../../../../../src/modules/statements/useCases/getBalance/GetBalanceError";
import { GetBalanceUseCase } from "../../../../../src/modules/statements/useCases/getBalance/GetBalanceUseCase"
import { IUsersRepository } from "../../../../../src/modules/users/repositories/IUsersRepository";
import { UsersRepositoryInMemory } from "../../../users/repositories/UsersRepositoryInMemory";
import { StatementsRepositoryInMemory } from "../../repositories/StatementsRepositoryInMemory";

describe('GetBalanceUseCase Tests', () => {
  let getBalanceUseCase: GetBalanceUseCase;
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;

  beforeEach(() => {
    usersRepository = new UsersRepositoryInMemory();
    statementsRepository = new StatementsRepositoryInMemory();

    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  })

  it('should not be able to get balance when user does not exists', async () => {
    await expect(getBalanceUseCase.execute({
      user_id: 'anyuserid'
    })).rejects.toBeInstanceOf(GetBalanceError);
  })

  it('should be able to get balance', async () => {
    const user = await usersRepository.create({
      email: 'anymail@mail.com',
      name: 'anyname',
      password: 'anypassword'
    })

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    })

    expect(response).toBeDefined();
    expect(response.balance).toBe(0);
    expect(response.statement).toHaveLength(0);
  })

  it('should be able to get balance with statements', async () => {
    const user = await usersRepository.create({
      email: 'anymail@mail.com',
      name: 'anyname',
      password: 'anypassword'
    })

    await statementsRepository.create({
      amount: 20,
      type: 'deposit' as any,
      description: 'anydesc',
      user_id: user.id as string,
    })

    await statementsRepository.create({
      amount: 10,
      type: 'withdraw' as any,
      description: 'anydesc',
      user_id: user.id as string,
    })

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    })

    expect(response).toBeDefined();
    expect(response.balance).toBe(10);
    expect(response.statement).toHaveLength(2);
  })
})
