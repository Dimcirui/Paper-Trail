# PaperTrail – CS 5200 Final Project

PaperTrail is a research-publication management platform for professors, graduate students, and research groups. It organizes papers, collaborators, venues, funding sources, and revision history in one relational database. The stack is:

- **Frontend / API**: Next.js 14 (App Router, API routes live beside UI)
- **ORM**: Prisma
- **Database**: MySQL 8 via Docker (plus Adminer for quick inspection)
- **Visualization**: Chart.js (to be wired when analytics screens are implemented)

## Repository layout

```
.
├── docker-compose.yml         # Containerized MySQL + Adminer
├── papertrail-app/            # Next.js 14 application (frontend + API)
│   ├── prisma/schema.prisma   # Relational model for PaperTrail
│   ├── src/app/api            # Health check + sample paper routes
│   └── src/app/page.tsx       # Landing page with team roadmap
└── README.md                  # Project overview + workflow
```

## Quick start

1. **Start the database**
   ```bash
   docker compose up -d db       # boots MySQL 8 with papertrail database
   docker compose up -d adminer  # optional UI on http://localhost:8080
   ```

2. **Configure env + install deps**
   ```bash
   cd papertrail-app
   cp .env.example .env.local
   npm install
   ```
   Set `API_AUTH_TOKEN` in `.env.local` before running the API; requests must include `Authorization: Bearer <token>` and may optionally send `X-User-Role` to access privileged fields.

3. **Generate the Prisma client + apply schema**
   ```bash
   npm run prisma:generate
   npm run db:push    # or `npm run db:migrate` once migrations exist
   ```

4. **Load stored procedures, triggers, and DB roles**
   - **Preferred (works regardless of host client version)**
     ```bash
     cd ..
     docker compose exec -T db sh -c 'mysql -uroot -proot' < database/stored_procedures.sql
     ```
   - **Host client alternative** (requires a MySQL CLI compatible with the container auth plugin):
     ```bash
     MYSQL_PWD=<password> mysql -h 127.0.0.1 -P 3306 -u root < database/stored_procedures.sql
     ```
   The script creates every stored procedure, trigger, scheduled event, and MySQL role documented in `docs/database.md` and `docs/stored_procedures.md`. It also generates random temporary passwords for the sample MySQL users (unless you set `@papertrail_admin_password`, etc. beforehand) and expires them so you can immediately rotate them.

5. **Run the app**
   ```bash
   npm run dev
   ```
   - http://localhost:3000 shows the collaboration dashboard landing page.
   - http://localhost:3000/api/health confirms that env vars are wired.
   - http://localhost:3000/api/papers demonstrates how backend logic lives inside `/api`.

## Suggested implementation plan

1. **Authentication & authorization** – Introduce NextAuth (or custom auth) that maps session roles to the `Role`/`User` tables. Guard dashboard routes using middleware and server components.
2. **CRUD modules** – Build dashboard routes around the Prisma models:
   - Papers + revisions (soft delete with `isDeleted`)
   - Authorship management + ordering UI
   - Grants, funding sources, and activity logs
3. **Analytics & reporting** – Create API routes that aggregate using Prisma (papers per year, per grant, per venue). Visualize using Chart.js components in the dashboard.
4. **Collaboration polish** – Add optimistic UI, notifications, and admin activity feeds using the `ActivityLog` table. Consider background jobs or scheduled API routes for reminders.

## Helpful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build + serve |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Regenerate Prisma client after schema edits |
| `npm run db:push` | Apply Prisma schema to the dev database |
| `npm run db:migrate` | Create/apply migrations once tables have data |
| `npm run db:studio` | Launch Prisma Studio for quick inspection |

Additional SQL automation lives in `database/stored_procedures.sql`. See `docs/database.md` for schema/normalization details and `docs/stored_procedures.md` for a walkthrough of every stored procedure, trigger, event, and role.

## Collaboration reminders

- Keep Prisma schema + migrations in version control so the team shares the same structure.
- Use feature folders inside `src/app` (e.g., `(dashboard)/papers`, `(dashboard)/analytics`) to co-locate UI, loaders, and actions.
- Prefer Prisma for data access inside server actions/API routes; avoid ad-hoc SQL until necessary.
- Before merging, run `npm run lint` and hit `http://localhost:3000/api/health` to ensure the environment is configured.
