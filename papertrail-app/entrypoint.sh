#!/bin/sh
set -e

echo "Running database migrations..."
# Use npx to run prisma from the local node_modules
# We need to make sure the prisma CLI and its dependencies are available
npx prisma migrate deploy

echo "Starting Next.js server..."
exec node server.js
