import { IUsersRepository } from "../../../../../src/modules/users/repositories/IUsersRepository";
import { CreateUserError } from "../../../../../src/modules/users/useCases/createUser/CreateUserError";
import { CreateUserUseCase } from "../../../../../src/modules/users/useCases/createUser/CreateUserUseCase"
import { UsersRepositoryInMemory } from "../../repositories/UsersRepositoryInMemory";

describe('CreateUserUseCase Tests', () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepository: IUsersRepository;

  beforeEach(() => {
    usersRepository = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it('should be able to create a new user', async () => {
    const response = await createUserUseCase.execute({
      name: 'anyname',
      email: 'anymail@mail.com',
      password: 'anypassword'
    });

    expect(response).toBeDefined();
    expect(response).toHaveProperty('id');
  })

  it('should not be able to create a new user if e-mail already exists', async () => {
    const user = await usersRepository.create({
      name: 'anyname',
      email: 'anymail@mail.com',
      password: 'anypassword'
    })

    await expect(createUserUseCase.execute({
      name: 'othername',
      email: user.email,
      password: 'otherpassword'
    })).rejects.toBeInstanceOf(CreateUserError);
  })
})
