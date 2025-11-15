# PaperTrail Data Architecture

## Normalization & schema rationale

The relational model in `papertrail-app/prisma/schema.prisma` mirrors the UML and satisfies Third Normal Form:

| Table | What it stores | 3NF justification |
| --- | --- | --- |
| `Role` | Unique role names only. No non-key attribute depends on another non-key attribute. |
| `User` | Person attributes; `roleId` is the only foreign key. Attributes such as `email`, `affiliation`, `orcid` describe the user and depend solely on the primary key (`id`). |
| `Paper` | Metadata about a manuscript. Derived values (e.g., venue name, contact author info) are intentionally moved to `Venue` and `User` to avoid duplication. Soft deletes use `isDeleted` to keep history without physical removal. |
| `Venue` | Publication venues with optional type/ranking fields. |
| `Authorship` | Intersection (many-to-many) between papers and users with author order & notes. Composite uniqueness on (`paperId`,`userId`) prevents duplicates. |
| `Topic` / `PaperTopic` | Topic dictionary plus junction table so papers can carry many tags without repeating topic strings. |
| `Grant` / `PaperGrant` | Funding opportunities and their linkage to papers. Reporting metadata is stored at the `Grant` level, not paper level, to keep dependencies clean. |
| `Revision` | Version history keyed by paper + optional author. Notes belong to a revision only. |
| `ActivityLog` | Audit entries referencing optional users so that automated jobs/events can still log actions. |

Additional indexes and referential actions (cascade, restrict, set null) in the Prisma schema make relationships explicit and reflect how deletions should behave.

## Stored procedures & triggers

All CRUD operations exposed to the application are implemented as MySQL stored procedures inside `database/stored_procedures.sql`. Highlights:

- `sp_create_paper`, `sp_update_paper_status`, `sp_soft_delete_paper` – enforce workflow logic and automatically log ActivityLog entries.
- `sp_assign_author`, `sp_record_revision`, `sp_add_grant_to_paper` – encapsulate writes to many-to-many tables so order/uniqueness rules are centralized.
- `sp_get_paper_overview` – provides a single call that returns the main paper details plus authors, revisions, and audit trail (useful for READ demos).

Triggers and events ensure the DB itself maintains invariants:

- `trg_revision_activity` writes audit records whenever a revision is inserted (even through direct SQL, e.g., imports).
- `trg_prevent_paper_delete` enforces soft deletes by rejecting raw `DELETE` statements.
- `trg_authorship_default_order` auto-assigns the next author order when omitted.
- `evt_flag_overdue_grants` and `evt_log_stale_drafts` run on schedules to keep grant reporting requirements and stale drafts visible.

Remember to enable the MySQL event scheduler (`SET GLOBAL event_scheduler = ON;`)—the SQL script already does this after creating the events.

## Role-based permissions

The SQL script also configures MySQL roles so permissions match application roles:

- `role_research_admin` – full EXECUTE rights on every stored procedure.
- `role_principal_investigator` – can create/update papers, manage authors, link grants, and read overviews.
- `role_contributor` – can record revisions and read data.
- `role_viewer` – read-only via `sp_get_paper_overview`.

Example users (`papertrail_admin`, `papertrail_pi`, `papertrail_contrib`, `papertrail_viewer`) are created with default passwords. Swap them before deploying to prod.

## How to run the database objects locally

1. Start MySQL via Docker: `docker compose up -d db`.
2. Apply Prisma schema: `cd papertrail-app && npm run prisma:generate && npm run db:push`.
3. Load the stored procedures/triggers/roles:
   ```bash
   mysql -h 127.0.0.1 -u root -p < database/stored_procedures.sql
   ```
4. Verify by logging into MySQL as one of the sample users and calling the procedures, for example:
   ```sql
   CALL papertrail.sp_get_paper_overview(1);
   ```

## How the app should call procedures

Prisma can execute raw SQL. For safety, wrap each server action in API routes that call the required procedure, for example:

```ts
await prisma.$executeRaw`
  CALL sp_create_paper(${title}, ${abstract}, ${status}, ${submissionDate}, ${publicationDate}, ${pdfUrl}, ${primaryContactId}, ${venueId}, ${actorId})
`;
```

This approach keeps business logic inside the database (as per course requirements) while letting the Next.js API act as a thin transport layer.

## Evidence for grading rubric

- **Data schema described** – UML + this document explain every entity and relation. Prisma schema is checked into source control.
- **CRUD demonstration** – Stored procedures cover Create/Read/Update/Delete; `sp_get_paper_overview` plus the audit triggers give verifiable proof via Adminer/MySQL client.
- **Permissions/robustness** – MySQL roles map to application roles; triggers prevent incorrect deletes; events and ActivityLog show ongoing monitoring.

Add screenshots or short Loom video calling each procedure (with Adminer open) to satisfy the course’s video rubric when you demo.
