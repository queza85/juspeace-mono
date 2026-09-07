#!/bin/sh
set -e

if [ -n "${DATABASE_URL}" ] || [ -n "${DB_HOST}" ]; then
  echo "Applying Prisma migrations..."
  attempt=1
  max_attempts=10

  while [ "$attempt" -le "$max_attempts" ]; do
    if node ./node_modules/prisma/build/index.js migrate deploy; then
      echo "Migrations applied successfully."
      break
    fi

    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "Failed to apply migrations after ${max_attempts} attempts."
      exit 1
    fi

    echo "Database not ready (attempt ${attempt}/${max_attempts}), retrying in 3s..."
    sleep 3
    attempt=$((attempt + 1))
  done

  if [ -f dist-seed/seed.js ]; then
    echo "Running database seed..."
    node dist-seed/seed.js
    echo "Database seed completed."
  fi
fi

exec "$@"
