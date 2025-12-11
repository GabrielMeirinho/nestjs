import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export function handlePostgresError(error: any): never {
  // TypeORM wraps the raw PG error as `driverError`
  // We "unwrap" it but keep a fallback to the original
  const isQueryFailed = error instanceof QueryFailedError;
  const pg: any = isQueryFailed && (error as any).driverError
    ? (error as any).driverError
    : error;

  // For debugging during dev (optional)
  console.log('Postgres error:', pg);

  switch (pg.code) {
    // 23505 - unique_violation
    case '23505':
      throw new ConflictException({
        message: 'Duplicate record',
        detail: pg.detail,            // "Key (email)=(...) already exists."
        constraint: pg.constraint,    // e.g. "UQ_e12875dfb3b1d92d7d7c5377e22"
        table: pg.table,              // "user"
      });

    // 23503 - foreign_key_violation
    case '23503':
      throw new BadRequestException({
        message: 'Foreign key violation',
        detail: pg.detail,
        constraint: pg.constraint,
        table: pg.table,
      });

    // 23502 - not_null_violation
    case '23502':
      throw new BadRequestException({
        message: 'Null value in non-nullable column',
        column: pg.column,
        table: pg.table,
        detail: pg.detail,
      });

    // 42P01 - undefined_table
    case '42P01':
      throw new NotFoundException({
        message: 'Table not found',
        table: pg.table,
        detail: pg.detail,
      });

    default:
      // Fallback for any unhandled DB error
      throw new InternalServerErrorException({
        message: 'Database error',
        code: pg.code,
        detail: pg.detail,
      });
  }
}
