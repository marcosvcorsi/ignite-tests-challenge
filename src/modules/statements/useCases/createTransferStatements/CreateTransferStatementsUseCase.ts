import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementsError } from "./CreateTransferStatementsError";
import { ICreateTransferStatements } from "./ICreateTransferStatementsDto";

type IResponse = {
  senderStatement: Statement,
  receiverStatement: Statement
}

@injectable()
export class CreateTransferStatementsUseCase {
  constructor(
    @inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private readonly statementsRepository: IStatementsRepository
  ) {}

  async execute({ sender_id, receiver_id, amount, description }: ICreateTransferStatements): Promise<IResponse> {
    if(amount < 0) {
      throw new CreateTransferStatementsError.InvalidAmount();
    }

    const sender = await this.usersRepository.findById(sender_id);

    if(!sender) {
      throw new CreateTransferStatementsError.SenderNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if(!receiver) {
      throw new CreateTransferStatementsError.ReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
      with_statement: false
    })

    if(amount > balance) {
      throw new CreateTransferStatementsError.InsufficientFunds();
    }

    const senderStatement = await this.statementsRepository.create({
      amount: -Math.abs(amount),
      description,
      type: 'transfer' as OperationType,
      user_id: sender_id,
      receiver_id,
    });


    const receiverStatement = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: receiver_id,
      sender_id,
    });

    return {
      senderStatement,
      receiverStatement
    }
  }
}
