# PaperTrail – CS 5200 Final Project

PaperTrail is a research-publication management platform for professors, graduate students, and research groups. It organizes papers, collaborators, venues, funding sources, and revision history in one relational database. The stack is:

- **Frontend / API**: Next.js 14 (App Router, API routes live beside UI)
- **ORM**: Prisma
- **Database**: MySQL 8 via Docker (plus Adminer for quick inspection)
- **Visualization**: Chart.js (to be wired when analytics screens are implemented)

## Repository layout

```
.
├── docker-compose.yml         # Containerized MySQL + Adminer (db + UI)
├── database/                  # SQL automation, stored procedures and seeds
├── docs/                      # Schema + stored-procedure documentation
├── papertrail-app/            # Next.js 14 app (frontend + API)
│   ├── prisma/schema.prisma   # Relational model for PaperTrail
│   ├── src/app/api            # Health, papers, and auth routes
│   └── src/app/page.tsx       # Landing page + roadmap
└── README.md                  # Project overview + workflow
```

## Full-stack spin-up (grading checklist)

1. **Launch containers**
   ```bash
   docker compose up -d
   ```
   The MySQL service maps port `3306` in the container to `3307` on the host (to avoid conflicts with any local MySQL), and Adminer is available at `http://localhost:8080` for quick inspections.

2. **Prepare the frontend environment**
   ```bash
   cd papertrail-app
   cp .env.example .env.local
   npm install
   ```
   - Edit `.env.local` (and `.env` if you rely on it elsewhere) and ensure `DATABASE_URL` points to `mysql://papertrail:papertrail@localhost:3307/papertrail`.
   - Set `API_AUTH_TOKEN` (used by the `/api/papers` endpoints) and any `NEXT_PUBLIC_*` variables you need for client-side demos.

3. **Prisma client + schema sync**
   ```bash
   npm run prisma:generate
   npm run db:push
   ```
   These commands regenerate the Prisma client and push the schema into the running Dockerized MySQL instance.

4. **Provision stored procedures and seed data**
   ```bash
   cat ../database/final_submission.sql | docker compose exec -T db mysql -u root -proot
   ```
   Everything—stored procedures, triggers, events, roles, and the real-world seed—is bundled in `database/final_submission.sql`. Running this single script restores the schema and demo data needed for grading. The script also generates the temporary passwords noted in the output so you can log in as any seeded user.
   ```bash
   mysql -h 127.0.0.1 -P 3307 -u root -proot -e "select userName, email from User limit 5" papertrail
   ```
   Repeat the quick query to confirm the seed completed successfully.

6. **Run the Next.js app**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:3000` to see the landing page.
   - `http://localhost:3000/api/health` confirms environment wiring.
   - `http://localhost:3000/api/papers` hits the papers route through API middleware.
   - **Login creds for demo accounts** (password for all: `pass`):
     - AdminUser — admin@papertrail.edu
     - Prof. Alice Smith — alice@papertrail.edu
     - Dr. Bob Jones — bob@papertrail.edu
     - Carol (PhD Student) — carol@papertrail.edu
     - Dave (Postdoc) — dave@papertrail.edu
     - Eve (External) — eve@partner.org
     - Frank Viewer — frank@guest.com

7. **Additional commands to verify grading-ready state**
   ```bash
   npm run lint
   npm run test:coverage
   npm run test:mutation
   ```
   Include the reports (especially the Stryker HTML output in `papertrail-app/reports/mutation`) when delivering the final submission.

## Helpful Scripts Reference

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm run start` | Production build + serve |
| `npm run lint` | ESLint on the entire app |
| `npm run prisma:generate` | Regenerate Prisma client after schema edits |
| `npm run db:push` | Apply Prisma schema to the dev database |
| `npm run db:migrate` | Create/apply migrations once tables have data |
| `npm run db:studio` | Launch Prisma Studio for a GUI view of the schema |
| `npm run test` | Jest in-band tests |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:mutation` | Stryker mutation testing (report in `reports/mutation`) |
