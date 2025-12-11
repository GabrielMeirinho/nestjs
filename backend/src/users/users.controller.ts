import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@ApiTags('users') // <--- this groups endpoints in Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOkResponse({ type: User, isArray: true })
  findAll(): Promise<User[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: User })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  create(@Body() body: CreateUserDto): Promise<User> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'User deleted' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { deleted: true };
  }
}
