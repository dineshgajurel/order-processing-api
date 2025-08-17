import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'db',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || '',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'orders_db',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false, // Use false in production!
  migrations: [path.join(__dirname, '../db/migrations/', '*.{ts,js}')],
  // ssl: { rejectUnauthorized: false },
};

export const configure = new DataSource(
  typeOrmConfig as PostgresConnectionOptions,
);
