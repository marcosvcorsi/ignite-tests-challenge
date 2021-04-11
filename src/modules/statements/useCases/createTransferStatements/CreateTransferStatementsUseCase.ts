import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementsError } from "./CreateTransferStatementsError";
import { ICreateTransferStatements } from "./ICreateTransferStatementsDto";

type IResponse = {
  fromStatement: Statement,
  toStatement: Statement
}

@injectable()
export class CreateTransferStatementsUseCase {
  constructor(
    @inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private readonly statementsRepository: IStatementsRepository
  ) {}

  async execute({ from, to, amount, description }: ICreateTransferStatements): Promise<IResponse> {
    if(amount < 0) {
      throw new CreateTransferStatementsError.InvalidAmount();
    }

    const fromUser = await this.usersRepository.findById(from);

    if(!fromUser) {
      throw new CreateTransferStatementsError.UserNotFound();
    }

    const toUser = await this.usersRepository.findById(to);

    if(!toUser) {
      throw new CreateTransferStatementsError.UserDestinationNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: from,
      with_statement: false
    })

    if(amount > balance) {
      throw new CreateTransferStatementsError.InsufficientFunds();
    }

    const fromStatement = await this.statementsRepository.create({
      amount: -Math.abs(amount),
      description,
      type: 'transfer' as OperationType,
      user_id: from
    });


    const toStatement = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: to
    });

    return {
      fromStatement,
      toStatement
    }
  }
}
