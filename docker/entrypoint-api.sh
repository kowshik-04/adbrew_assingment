#!/bin/sh
set -e

# Entrypoint script: waits for Mongo to become available, then runs collectstatic and finally the CMD (gunicorn).
# This script runs as the non-root 'appuser' (as defined in Dockerfile).

: "${MONGO_HOST:=mongo}"
: "${MONGO_PORT:=27017}"

echo "[entrypoint] using MONGO_HOST=${MONGO_HOST} MONGO_PORT=${MONGO_PORT}"

# Wait for Mongo to be reachable (20 attempts)
echo "[entrypoint] waiting for mongo..."
python - <<PY
import os, socket, time, sys
host = os.environ.get("MONGO_HOST", "mongo")
port = int(os.environ.get("MONGO_PORT", 27017))
attempts = 20
for i in range(attempts):
    try:
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        print("[entrypoint] mongo reachable")
        sys.exit(0)
    except Exception as e:
        print(f"[entrypoint] attempt {i+1}/{attempts} - mongo not ready ({e})")
        time.sleep(1)
print("[entrypoint] mongo did not become ready - exiting")
sys.exit(1)
PY

# If a .env.prod was copied into /app/.env.prod, allow django-dotenv to load it if settings.py reads DJANGO_DOTENV_PATH.
if [ -f /app/.env.prod ]; then
  export DJANGO_DOTENV_PATH=/app/.env.prod
  echo "[entrypoint] using /app/.env.prod for environment variables"
fi

# collectstatic (safe to run multiple times)
echo "[entrypoint] running collectstatic"
python manage.py collectstatic --noinput --clear || echo "[entrypoint] collectstatic returned non-zero (continuing)"

# finally exec the given command (gunicorn)
echo "[entrypoint] exec: $@"
exec "$@"
