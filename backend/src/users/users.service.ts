import { Injectable } from '@nestjs/common';
import { handlePostgresError } from '../common/pg.error.utils';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
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
      handlePostgresError(`User ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const entity = this.repo.create(dto);

    try {
        return await this.repo.save(entity);
    } catch (error) {

        // Check if this is a DB-level query error
        if (error instanceof QueryFailedError) {

        const pgError: any = error;

        console.log('Postgres error:', pgError);

        // Unique violation -> 23505
        if (pgError.code === '23505') {

            // Example:
            const detail = pgError.detail || 'Duplicate key';

            return Promise.reject(
                handlePostgresError({
                message: 'Duplicate record',
                detail: detail,
                constraint: pgError.constraint,
            }),
            );
        }
        }
        // fallback - unexpected error
        handlePostgresError('Unexpected database error');
    }
}

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
