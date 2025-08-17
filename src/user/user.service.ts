import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepo.findOneBy({ email });

    if (user) {
      return user;
    }
    throw new NotFoundException('User not found');
  }

  // async findById(id: number) {
  //   console.log('findById', id);
  //   const user = await this.usersRepo.findOne({
  //     where: { id },
  //   });

  //   console.log('User found:', user);

  //   return user;
  // }

  async create(user: Partial<User>): Promise<User> {
    const { email } = user;
    const existingUser = await this.usersRepo.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    try {
      const newUser = this.usersRepo.create(user);
      return await this.usersRepo.save(newUser);
    } catch (error) {
      // console.error('Error creating user:', error);
      throw new Error('Error while creating new user');
    }
  }

  async findAll(
    page = 1,
    perPage = 10,
  ): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepo.findAndCount({
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { data, total };
  }

  async softDelete(id: number): Promise<User> {
    const user = await this.usersRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const deletedUser = await this.usersRepo.softDelete(id);
    if (deletedUser.affected !== 1) {
      throw new InternalServerErrorException('Failed to delete user');
    }
    return user;
  }
}
