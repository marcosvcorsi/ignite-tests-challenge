import { IStatementsRepository } from "../../../../../src/modules/statements/repositories/IStatementsRepository";
import { GetStatementOperationError } from "../../../../../src/modules/statements/useCases/getStatementOperation/GetStatementOperationError";
import { GetStatementOperationUseCase } from "../../../../../src/modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase"
import { IUsersRepository } from "../../../../../src/modules/users/repositories/IUsersRepository";
import { UsersRepositoryInMemory } from "../../../users/repositories/UsersRepositoryInMemory";
import { StatementsRepositoryInMemory } from "../../repositories/StatementsRepositoryInMemory";

describe('GetStatementOperationUseCase Tests', () => {
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;

  beforeEach(() => {
    usersRepository = new UsersRepositoryInMemory();
    statementsRepository = new StatementsRepositoryInMemory();

    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
  })

  it('should not be able to get operation statement when user does not exists', async () => {
    await expect(getStatementOperationUseCase.execute({
      user_id: 'anyuserid',
      statement_id: 'anystatementid'
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })

  it('should not be able to get operation statement when statement does not exists', async () => {
    const user = await usersRepository.create({
      email: 'anymail@mail.com',
      name: 'anyname',
      password: 'anypassword'
    })

    await expect(getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: 'anystatementid'
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })

  it('should be able to get operation statement on success', async () => {
    const user = await usersRepository.create({
      email: 'anymail@mail.com',
      name: 'anyname',
      password: 'anypassword'
    });

    const statement = await statementsRepository.create({
      user_id: user.id as string,
      amount: 10,
      description: 'anydesc',
      type: 'deposit' as any,
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    })

    expect(statementOperation).toEqual(statement);
  })
})
