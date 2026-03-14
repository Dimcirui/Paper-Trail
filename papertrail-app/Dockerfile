# Build context: repo root (.)
# docker-compose build context must be set to "." for outputFileTracingRoot to resolve correctly

FROM node:20-alpine AS deps
WORKDIR /app/papertrail-app
COPY papertrail-app/package.json papertrail-app/package-lock.json ./
COPY papertrail-app/prisma/ ./prisma/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app/papertrail-app
COPY --from=deps /app/papertrail-app/node_modules ./node_modules
COPY papertrail-app/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app/papertrail-app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output
COPY --from=builder /app/papertrail-app/public ./public
COPY --from=builder /app/papertrail-app/.next/standalone ./
COPY --from=builder /app/papertrail-app/.next/static ./.next/static

# Prisma CLI + client for migrations
COPY --from=builder /app/papertrail-app/prisma ./prisma
COPY --from=builder /app/papertrail-app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/papertrail-app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/papertrail-app/node_modules/prisma ./node_modules/prisma

COPY papertrail-app/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
