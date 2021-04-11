import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferStatementsError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class UserDestinationNotFound extends AppError {
    constructor() {
      super('User destination not found', 404);
    }
  }

  export class InvalidAmount extends AppError {
    constructor() {
      super('Invalid amount', 400);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}
