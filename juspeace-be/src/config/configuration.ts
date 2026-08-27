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
});
