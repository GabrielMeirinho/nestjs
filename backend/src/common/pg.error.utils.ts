import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export function mapPostgresError(error: any): HttpException {
  // Unwrap raw PG error if coming from TypeORM
  const pg: any =
    error instanceof QueryFailedError && (error as any).driverError
      ? (error as any).driverError
      : error;

  // Optional for debugging:
  // console.log('PG CODE:', pg.code, 'DETAIL:', pg.detail);

  switch (pg.code) {
    // 23505 - unique_violation (duplicate)
    case '23505': {
      // If it's our user email unique constraint → custom message
      const detail: string = pg.detail || '';
      const isEmailUnique =
        detail.includes('(email)') || String(pg.constraint || '').includes('email');

      return new ConflictException({
        message: isEmailUnique
          ? 'A user with this email already exists.'
          : 'Duplicate record',
        detail: pg.detail,
        constraint: pg.constraint,
        table: pg.table,
      });
    }

    // 23503 - foreign_key_violation
    case '23503':
      return new BadRequestException({
        message: 'Foreign key violation',
        detail: pg.detail,
        constraint: pg.constraint,
        table: pg.table,
      });

    // 23502 - not_null_violation
    case '23502':
      return new BadRequestException({
        message: 'Null value in non-nullable column',
        column: pg.column,
        table: pg.table,
        detail: pg.detail,
      });

    // 42P01 - undefined_table
    case '42P01':
      return new NotFoundException({
        message: 'Table not found',
        table: pg.table,
        detail: pg.detail,
      });

    default:
      return new InternalServerErrorException({
        message: 'Database error',
        code: pg.code,
        detail: pg.detail,
      });
  }
}
