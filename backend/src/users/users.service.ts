import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { mapPostgresError } from 'src/common/pg.error.utils';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const entity = this.repo.create(dto);

    try {
      return await this.repo.save(entity);
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw mapPostgresError(error);
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);

    try {
      return await this.repo.save(user);
    } catch (error) {
      this.logger.error(`Error updating user ${id}`, error.stack);
      throw mapPostgresError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
