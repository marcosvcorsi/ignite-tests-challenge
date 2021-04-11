import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementsUseCase } from "./CreateTransferStatementsUseCase";

export class CreateTransferStatementsController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { user_id } = request.params
    const { amount, description } = request.body;

    const createTransferStatementsUseCase = container.resolve(CreateTransferStatementsUseCase);

    const statements = await createTransferStatementsUseCase.execute({
      from: id,
      to: user_id,
      amount,
      description,
    })

    return response.status(201).json(statements);
  }
}
