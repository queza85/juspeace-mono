import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { buildDatabaseUrl } from './database-url';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 7777;

  /** Optional override. When omitted, built from DB_* below. */
  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string = '127.0.0.1';

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USER: string = 'postgres';

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string = 'juspeace_develop';

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  // Prisma reads process.env.DATABASE_URL — keep it in sync with DB_* (or override).
  const databaseUrl = buildDatabaseUrl({
    DATABASE_URL: validated.DATABASE_URL,
    DB_HOST: validated.DB_HOST,
    DB_PORT: String(validated.DB_PORT),
    DB_USER: validated.DB_USER,
    DB_PASSWORD: validated.DB_PASSWORD,
    DB_DATABASE: validated.DB_DATABASE,
  });

  process.env.DATABASE_URL = databaseUrl;
  validated.DATABASE_URL = databaseUrl;

  return validated;
}
