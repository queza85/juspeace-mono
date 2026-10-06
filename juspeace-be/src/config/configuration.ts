import { buildDatabaseUrl } from './database-url';

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 7777),
  database: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_DATABASE ?? 'juspeace_develop',
    url: buildDatabaseUrl(),
  },
  databaseUrl: buildDatabaseUrl(),
  corsOrigins: (
    process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  auth: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),
    refreshTokenSessionTtlDays: Number(
      process.env.REFRESH_TOKEN_SESSION_TTL_DAYS ?? 1,
    ),
    refreshTokenRememberTtlDays: Number(
      process.env.REFRESH_TOKEN_REMEMBER_TTL_DAYS ?? 5,
    ),
    cookieName: process.env.AUTH_COOKIE_NAME ?? 'juspeace_refresh',
    cookieSecure:
      process.env.AUTH_COOKIE_SECURE !== undefined
        ? process.env.AUTH_COOKIE_SECURE === 'true' ||
          process.env.AUTH_COOKIE_SECURE === '1'
        : process.env.NODE_ENV === 'production',
    oauth: {
      successRedirectUrl:
        process.env.OAUTH_SUCCESS_REDIRECT_URL ??
        'http://localhost:3000/auth/callback',
      failureRedirectUrl:
        process.env.OAUTH_FAILURE_REDIRECT_URL ??
        'http://localhost:3000/login?error=oauth',
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        callbackUrl:
          process.env.GOOGLE_CALLBACK_URL ??
          'http://localhost:7777/api/v1/auth/google/callback',
      },
    },
  },
  mail: {
    from: process.env.MAIL_FROM ?? 'Juspeace Admin <noreply@juspeace.local>',
    smtp: {
      host: process.env.SMTP_HOST ?? '127.0.0.1',
      port: Number(process.env.SMTP_PORT ?? 1025),
      user: process.env.SMTP_USER ?? '',
      password: process.env.SMTP_PASSWORD ?? '',
      secure:
        process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1',
    },
  },
  passwordReset: {
    codeTtlMinutes: Number(process.env.PASSWORD_RESET_CODE_TTL_MINUTES ?? 10),
    tokenTtlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? 15),
  },
  twoFactor: {
    codeTtlMinutes: Number(process.env.TWO_FACTOR_CODE_TTL_MINUTES ?? 10),
    challengeTtlMinutes: Number(
      process.env.TWO_FACTOR_CHALLENGE_TTL_MINUTES ?? 15,
    ),
    devChallengeEnabled:
      process.env.TWO_FACTOR_DEV_CHALLENGE === 'true' ||
      process.env.TWO_FACTOR_DEV_CHALLENGE === '1',
  },
  registry: {
    registrationTokenTtlDays: Number(
      process.env.REGISTRATION_TOKEN_TTL_DAYS ?? 30,
    ),
  },
  storage: {
    connectionString: process.env.CONNECTION_STRING ?? '',
    containerName: process.env.CONTAINER_NAME ?? '',
  },
});
