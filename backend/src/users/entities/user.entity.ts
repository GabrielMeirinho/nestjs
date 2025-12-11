import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Robert' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ example: 'jason.todd@gothan.com' })
  @Column({ unique: true })
  email: string;
}
