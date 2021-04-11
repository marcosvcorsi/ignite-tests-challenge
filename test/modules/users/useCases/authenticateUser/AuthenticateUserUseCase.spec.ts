import { hash } from "bcryptjs";
import { IUsersRepository } from "../../../../../src/modules/users/repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "../../../../../src/modules/users/useCases/authenticateUser/AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "../../../../../src/modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError";
import { UsersRepositoryInMemory } from "../../repositories/UsersRepositoryInMemory";

describe('AuthenticateUserUseCase Tests', () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let usersRepository: IUsersRepository;

  beforeEach(async () => {
    usersRepository = new UsersRepositoryInMemory();

    const password = await hash('123456', 8);

    usersRepository.create({
      email: 'anymail@mail.com',
      name: 'anyname',
      password,
    })

    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  })

  it('should be able to authenticate user', async () => {
    const response = await authenticateUserUseCase.execute({
      email: 'anymail@mail.com',
      password: '123456'
    })

    expect(response).toBeDefined();
    expect(response).toHaveProperty('user');
    expect(response).toHaveProperty('token');
  })

  it('should not be able to authenticate when user email does not exists', async () => {
    await expect(authenticateUserUseCase.execute({
      email: 'invalid_email@mail.com',
      password: '123456'
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it('should not be able to authenticate when user password does not match', async () => {
    await expect(authenticateUserUseCase.execute({
      email: 'anymail@mail.com',
      password: 'invalid-password'
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })
})
