import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { buildDatabaseUrl } from './database-url';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }
  return false;
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

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TTL: string = '15m';

  @IsInt()
  @Min(1)
  @Max(365)
  REFRESH_TOKEN_TTL_DAYS: number = 7;

  @IsString()
  @IsNotEmpty()
  AUTH_COOKIE_NAME: string = 'juspeace_refresh';

  @IsBoolean()
  AUTH_COOKIE_SECURE: boolean = false;

  @IsString()
  @IsOptional()
  SEED_ADMIN_EMAIL?: string;

  @IsString()
  @IsOptional()
  SEED_ADMIN_PASSWORD?: string;

  @IsString()
  @IsOptional()
  SEED_USER_EMAIL?: string;

  @IsString()
  @IsOptional()
  SEED_USER_PASSWORD?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const withDefaults = {
    ...config,
    AUTH_COOKIE_SECURE:
      config.AUTH_COOKIE_SECURE !== undefined
        ? toBoolean(config.AUTH_COOKIE_SECURE)
        : config.NODE_ENV === Environment.Production,
  };

  const validated = plainToInstance(EnvironmentVariables, withDefaults, {
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
