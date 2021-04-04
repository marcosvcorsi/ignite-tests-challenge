import { Statement } from "../../../../src/modules/statements/entities/Statement";
import { IStatementsRepository } from "../../../../src/modules/statements/repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../../../../src/modules/statements/useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../../../src/modules/statements/useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../../../src/modules/statements/useCases/getStatementOperation/IGetStatementOperationDTO";


export class StatementsRepositoryInMemory implements IStatementsRepository {
  private statements: Statement[] = [];

  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();

    Object.assign(statement, data);

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(operation => (
      operation.id === statement_id &&
      operation.user_id === user_id
    ));
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const statement = this.statements.filter(operation => operation.user_id === user_id);

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'deposit') {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}