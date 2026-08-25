/**
 * Builds a Prisma-compatible PostgreSQL URL from discrete DB_* vars,
 * or returns DATABASE_URL when already set (Docker overrides).
 */
export function buildDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const explicit = env.DATABASE_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const host = env.DB_HOST?.trim() || '127.0.0.1';
  const port = env.DB_PORT?.trim() || '5432';
  const user = encodeURIComponent(env.DB_USER?.trim() || 'postgres');
  const password = encodeURIComponent(env.DB_PASSWORD ?? '');
  const database = env.DB_DATABASE?.trim() || 'juspeace_develop';

  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}
