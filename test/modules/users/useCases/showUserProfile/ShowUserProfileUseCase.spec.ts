import { IUsersRepository } from "../../../../../src/modules/users/repositories/IUsersRepository";
import { ShowUserProfileError } from "../../../../../src/modules/users/useCases/showUserProfile/ShowUserProfileError";
import { ShowUserProfileUseCase } from "../../../../../src/modules/users/useCases/showUserProfile/ShowUserProfileUseCase"
import { UsersRepositoryInMemory } from "../../repositories/UsersRepositoryInMemory";

describe('ShowUserProfileUseCase Tests', () => {
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let usersRepository: IUsersRepository;

  beforeEach(() => {
    usersRepository = new UsersRepositoryInMemory();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  })

  it('should not be able to show user profile when user id does not exists', async () => {
    await expect(showUserProfileUseCase.execute('anyuserid')).rejects.toBeInstanceOf(ShowUserProfileError);
  })

  it('should be able to show user profile', async () => {
    const user = await usersRepository.create({
      email: 'anymail@mail.com',
      name: 'anyname',
      password: 'anypassword',
    })

    const response = await showUserProfileUseCase.execute(user.id as string);

    expect(response).toEqual(user);
  })
})
