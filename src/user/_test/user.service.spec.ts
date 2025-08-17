import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { UserRole } from 'src/common/enums/common.enum';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: 1,
    email: 'newuser@example.com',
    password: 'password',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNonExistantEmail = 'nonexistant@email.com';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    let findOneBySpy: jest.SpyInstance;

    beforeEach(() => {
      findOneBySpy = jest.spyOn(userRepository, 'findOneBy');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return user', async () => {
      findOneBySpy.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(findOneBySpy).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it('should throw NotFoundException if not found', async () => {
      findOneBySpy.mockResolvedValue(null);

      await expect(service.findByEmail(mockNonExistantEmail)).rejects.toThrow(
        NotFoundException,
      );
      expect(findOneBySpy).toHaveBeenCalledWith({
        email: mockNonExistantEmail,
      });
    });
  });

  describe('create', () => {
    let findOneBySpy: jest.SpyInstance;
    let createSpy: jest.SpyInstance;
    let saveSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneBySpy = jest.spyOn(userRepository, 'findOneBy');
      createSpy = jest.spyOn(userRepository, 'create');
      saveSpy = jest.spyOn(userRepository, 'save');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a user', async () => {
      findOneBySpy.mockResolvedValue(null);
      createSpy.mockReturnValue(mockUser);
      saveSpy.mockResolvedValue(mockUser);

      const result = await service.create({ email: mockUser.email });

      expect(result).toEqual(mockUser);
      expect(createSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalledWith(mockUser);
    });

    it('should throw BadRequestException if email already exists', async () => {
      findOneBySpy.mockResolvedValue(mockUser);

      await expect(service.create({ email: mockUser.email })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if save fails', async () => {
      findOneBySpy.mockResolvedValue(null);
      createSpy.mockReturnValue(mockUser);
      saveSpy.mockRejectedValue(new Error('DB fail'));

      await expect(service.create({ email: mockUser.email })).rejects.toThrow(
        'Error while creating new user',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users list', async () => {
      const findAndCountSpy = jest.spyOn(userRepository, 'findAndCount');
      findAndCountSpy.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({ data: [mockUser], total: 1 });
      expect(findAndCountSpy).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });
  });

  describe('softDelete', () => {
    let findOneBySpy: jest.SpyInstance;
    let softDeleteSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneBySpy = jest.spyOn(userRepository, 'findOneBy');
      softDeleteSpy = jest.spyOn(userRepository, 'softDelete');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should soft delete a user', async () => {
      findOneBySpy.mockResolvedValue(mockUser);
      softDeleteSpy.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);

      const result = await service.softDelete(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(softDeleteSpy).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      findOneBySpy.mockResolvedValue(null);

      await expect(service.softDelete(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerError if deleting fails', async () => {
      findOneBySpy.mockResolvedValue(mockUser);
      softDeleteSpy.mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);

      // softDeleteSpy.mockRejectedValue(new Error('DB fail'));

      await expect(service.softDelete(mockUser.id)).rejects.toThrow(
        'Failed to delete user',
      );
    });
  });
});
