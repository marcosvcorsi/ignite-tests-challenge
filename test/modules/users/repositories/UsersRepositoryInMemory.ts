import { User } from "../../../../src/modules/users/entities/User";
import { IUsersRepository } from "../../../../src/modules/users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../../src/modules/users/useCases/createUser/ICreateUserDTO";

export class UsersRepositoryInMemory implements IUsersRepository {
  private users: User[];

  constructor() {
    this.users = [];
  }

  async create(data: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, data);

    this.users.push(user);

    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = this.users.find(user => user.id === id);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = this.users.find(user => user.email === email);

    return user;
  }
}
