## PaperTrail Web App

PaperTrail is the SunXHoC team’s research-publication management platform. This folder contains the Next.js 14 frontend, API routes, and Prisma integration.

### Prerequisites

- Node 20+
- Docker (for the shared MySQL instance defined in `/docker-compose.yml`)

### Environment

1. Copy the sample env file:
   ```bash
   cp .env.example .env.local
   ```
2. Update `DATABASE_URL` if you are not using the default Docker credentials.

### Install & run

```bash
npm install
npm run prisma:generate
npm run db:push   # sets up tables locally (or run db:migrate when migrations exist)
mysql -h 127.0.0.1 -u root -p < ../database/stored_procedures.sql  # loads stored procs/triggers/roles
npm run dev
```

- Visit http://localhost:3000 to view the landing page & roadmap.
- http://localhost:3000/api/health verifies env wiring.
- http://localhost:3000/api/papers demonstrates how server routes will interact with Prisma.

### Project structure highlights

- `src/app/page.tsx` – onboarding hub describing features & next steps.
- `src/app/api/health` – environment check route (useful for remote debugging).
- `src/app/api/papers` – stubbed CRUD route with Prisma access pattern.
- `src/lib/prisma.ts` – single Prisma client instance used across server code.
- `prisma/schema.prisma` – relational schema that mirrors the UML diagram.
- `../database/stored_procedures.sql` – canonical set of stored procedures, triggers, events, and role grants.

### Next steps

1. Add NextAuth (or custom auth) hooking into `Role` + `User` tables.
2. Scaffold dashboard routes under `src/app/(dashboard)` to group paper, grant, and analytics experiences.
3. Add Chart.js visualizations & caching to deliver analytics quickly.
4. Track significant server actions with the `ActivityLog` model, surfaced in notifications/history panels.
