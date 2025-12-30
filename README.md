# PaperTrail – A Publication Management Dashboard

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

## System prerequisites

The following software must already be installed on the grader’s machine:

- **Docker Desktop / Docker Engine** – Hosts the MySQL 8 container and Adminer UI. Download from https://www.docker.com/products/docker-desktop and install per the platform defaults (macOS/Linux/Windows). The compose file runs from the repo root (`5200_final_proj`) so the expected working directory is that root folder.
- **Node.js 20.x** (LTS) – Powers the Next.js 14 application and Prisma CLI. Download from https://nodejs.org/en/download/ or install via `nvm install 20`. `npm` is bundled with Node.
- **MySQL CLI (optional)** – Only needed if you want to query the database without Docker. Download from https://dev.mysql.com/downloads/mysql/. Otherwise use the `docker compose exec -T db mysql` command flow documented below.
- **git** – For cloning the repo into a local folder (e.g., `~/projects/5200_final_proj`).

All commands assume the repo lives in its root directory (`/path/to/5200_final_proj`). If you install Docker/Node elsewhere, adjust your PATH before running the scripts below.

## Full-stack spin-up

1. **Launch containers**
   ```bash
   docker compose up -d
   ```
   The MySQL service maps port `3306` in the container to `3307` on the host (to avoid conflicts with any local MySQL), and Adminer is available at `http://localhost:8080` for quick inspections.

2. **Prepare the frontend environment**
   
   For macOS/Linux/Windows Powershell:
   ```bash
   cd papertrail-app
   cp .env.example .env.local
   npm install
   ```
   For Windows CMD:
   ```bash
   cd papertrail-app
   copy .env.example .env.local
   npm install
   ```
   - Edit `.env.local` (and `.env` if you rely on it elsewhere) and ensure `DATABASE_URL` points to `mysql://papertrail:papertrail@localhost:3307/papertrail`.
   - Set `API_AUTH_TOKEN` (used by the `/api/papers` endpoints) and any `NEXT_PUBLIC_*` variables you need for client-side demos.

4. **Prisma client + schema sync**
   ```bash
   npm run prisma:generate
   npm run db:push
   ```
   These commands regenerate the Prisma client and push the schema into the running Dockerized MySQL instance.

5. **Provision stored procedures and seed data**
   
   Before this step, please ensure you are already in the papertrail-app directory.
   
   For macOS/Linux/Windows Powershell:
   ```bash
   cat ..\database\final_submission.sql | docker compose exec -T db mysql -u root -proot
   ```
   For Windows CMD:
   ```bash
   type ../database/final_submission.sql | docker compose exec -T db mysql -u root -proot
   ```
   Everything—stored procedures, triggers, events, roles, and the real-world seed—is bundled in `database/final_submission.sql`. Running this single script restores the schema and demo data needed for grading. The script also generates the temporary passwords noted in the output so you can log in as any seeded user.
   Verify the data(Optional):
   ```bash
   # Option A: Using local MySQL client (requires MySQL in PATH)
   mysql -h 127.0.0.1 -P 3307 -u root -proot -e "select userName, email from User limit 5" papertrail
   # Option B: Using Docker executable (No local install required)
   docker compose exec -T db mysql -u root -proot -e "select userName, email from User limit 5" papertrail
   ```

6. **Run the Next.js app**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:3000` to see the landing page.
   - `http://localhost:3000/api/health` confirms environment wiring.
   - `http://localhost:3000/api/papers` hits the papers route through API middleware.
   - **Login creds for demo accounts** (password for all: `pass`, one per role):
     - Research Admin — admin@papertrail.local
     - Principal Investigator — priya.natarajan@yale.edu
     - Contributor — lena.becker@tum.de
     - Viewer — viewer@papertrail.local
   - **Adminer (DB GUI) access** on `http://localhost:8080`:
     - System: MySQL
     - Server: 127.0.0.1
     - Port: 3307
     - Username: root
     - Password: root
     - Database: papertrail

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

## CRUD Demonstration & Modular Flow

The UI + API together execute the full CRUD spectrum for PaperTrail’s research-domain data:
1. **Create** – The dashboard's **Create Paper** modal posts to `/api/papers`, which calls `sp_create_paper` (via Prisma) and inserts supporting `Authorship`, `PaperTopic`, and `ActivityLog` entries for the chosen PI/contributor. The same pattern is reused for recording revisions and attaching grants.
2. **Read** – The table/list blocks on `/dashboard` and the paper detail drawer read `Paper`, `Authorship`, `PaperTopic`, `Revision`, and `ActivityLog` rows through `/api/papers`, plus related lookup tables (`Venue`, `Role`, etc.). Filters/search hit the same API and render polished status chips or stubbed analytics cards.
3. **Update** – Status dropdowns, inline edit forms, and the Instrumented APIs call `sp_update_paper_status`, `sp_assign_author`, and Prisma mutation routes to update `Paper.status`, `Authorship` positions, `Revision` notes, and more; each request re-reads the latest data so UI reflects the mutation immediately.
4. **Delete** – The Delete/Archive button invokes `sp_soft_delete_paper` so we never physically drop `Paper` rows; `isDeleted` toggles while `ActivityLog` records the soft-delete action. Other entities (e.g., `Authorship`, `PaperTopic`) are cleaned up via cascading foreign keys or dedicated API flows when a paper is purged. Administrators can optionally run `sp_hard_delete_paper` through the dashboard (hard delete button/endpoint) to fully purge a paper and all dependent rows when needed.

Every UI action that touches the database is routed through reusable handler functions (`createPaper`, `updateStatus`, `addRevision`, etc.) and stored procedures/triggers that encapsulate business logic, ensuring the front end only calls high-level abstractions rather than mixing SQL text in the components.

## Error Handling & Safety Nets

- **API routes** validate arguments and return the correct HTTP status (400 for missing fields, 401 when credentials fail, 403/404 when a resource is not accessible, 500 for unexpected errors). Each try/catch block logs the caught error before sending a response, so the UI can show informative toasts and the console includes enough context for debugging.
- **Stored procedures** use `START TRANSACTION` + `EXIT HANDLER FOR SQLEXCEPTION` so any failure rolls back and surfaces via the API error flow; `sp_create_paper`, `sp_assign_author`, and `sp_add_grant_to_paper` all log to `ActivityLog` on success so you can trace every mutation.
- **Triggers/events** capture odder cases: `trg_revision_activity` logs revisions, `trg_prevent_paper_delete` enforces soft deletes, `evt_flag_overdue_grants` and `evt_log_stale_drafts` keep reporting items fresh. These DB-side protections ensure even direct SQL clients honor business rules.

## Verification (Dump Integrity)

Before submitting, run the dump on a clean environment and confirm every object is created:

```bash
docker compose down --volumes
docker compose up -d
cat database/final_submission.sql | docker compose exec -T db mysql -u root -proot
docker compose exec -T db mysql -u root -proot -e "SHOW TABLES" papertrail
```

The script re-creates the schema, indexes, constraints, stored procedures, triggers, events, roles, demo users (`admin@papertrail.local`, `priya.natarajan@yale.edu`, etc.), and the 150-paper seed, so the command output should list all tables and no errors appear. Paste the logged output in the final write-up or commit notes to prove the dump runs cleanly.

## Rubric Alignment Summary

| Learning Outcome | Evidence |
| --- | --- |
| **Complex schema (3NF + ≥9 tables)** | `database/final_submission.sql` creates 11 tables plus join tables (`Authorship`, `PaperTopic`, `PaperGrant`); every table uses narrow keys, lookup tables, and no redundant data. |
| **PKs/FKs + ON UPDATE/ON DELETE** | All tables declare primary keys, and each foreign key in the dump specifies `ON UPDATE`/`ON DELETE` actions (CASCADE/RESTRICT/SET NULL) to keep referential integrity. |
| **Field constraints** | Columns declare `NOT NULL`, defaults, `ENUM` values, `UNIQUE` keys, and indexes (e.g., `User.email`, `Role.roleName`, `Paper.status`). |
| **Programming objects** | The dump contains stored procedures (`sp_create_paper`, `sp_assign_author`, etc.), triggers (`trg_revision_activity`, `trg_prevent_paper_delete`), events (`evt_flag_overdue_grants`, `evt_log_stale_drafts`), and roles. |
| **Client completeness (CRUD/UI)** | Dashboard forms + API routes cover Create/Read/Update/Delete; stored/SQL objects ensure consistent results; README’s CRUD section documents the end-to-end flows. |
| **Modularity & error handling** | Server handlers delegate to reusable helpers and stored procedures; each route validates input, catches database errors, and logs details; SQL procedures wrap mutations in transactions with `EXIT HANDLER` blocks. |
