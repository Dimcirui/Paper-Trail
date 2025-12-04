# Stored Procedures & Automation

This document explains what lives inside `database/stored_procedures.sql` so you can reference it in demos, reports, and grading rubrics.

## Running the script

```bash
docker compose exec -T db sh -c 'mysql -uroot -proot' < database/stored_procedures.sql
```

The command above streams the SQL into the containerized MySQL instance. Swap credentials if you changed the root password or want to run as another user. When the script finishes, all routines, triggers, events, and roles described below are present. To override the generated temporary passwords for MySQL users, set session variables such as `SET @papertrail_admin_password='MyStrongPW';` before sourcing the file.

## Stored procedures

| Procedure | Purpose |
| --- | --- |
| `sp_create_paper` | Inserts a new paper inside an explicit transaction, applies defaults, and logs a `PAPER_CREATED` activity entry. Returns the created row so the API can confirm values. |
| `sp_update_paper_status` | Changes a paper’s status, updates timestamps, and records an audit entry inside the same transaction. |
| `sp_soft_delete_paper` | Implements “Delete” by toggling `isDeleted`, forcing the status to `Withdrawn`, and logging the action atomically. |
| `sp_hard_delete_paper` | Removes a paper and all dependent records (authorships, topics, grants, revisions, activity logs) inside a single transaction; it temporarily enables the delete trigger so we can bypass the soft delete guard when admin tooling needs a full purge. |
| `sp_assign_author` | Upserts an authorship link, derives the next author order (if one isn’t provided) without relying on triggers, and logs the change. |
| `sp_record_revision` | Adds entries to the `Revision` table (the trigger below mirrors entries into `ActivityLog`). |
| `sp_add_grant_to_paper` | Upserts a `PaperGrant` row and writes an audit message. |
| `sp_get_paper_overview` | Multi-result-set read that returns paper metadata, authors, revisions, and activities—use this when demonstrating READ operations in a SQL client. |
| `sp_create_activity` | Utility used by automated jobs or admin tooling to add arbitrary audit entries. |

These routines centralize all CRUD logic inside the database, which satisfies the “database programming objects” and “operations stored in the DB” rubric items. Multi-step procedures are wrapped in transactions so partial writes cannot occur.

## Triggers

- `trg_revision_activity` – After every revision insert, copies the detail into `ActivityLog` with the `REVISION_ADDED` action. Demonstrates automatic logging independent of the application.
- `trg_prevent_paper_delete` – Throws an error if anyone attempts a hard `DELETE` against `Paper`, enforcing soft deletes unless `sp_hard_delete_paper` temporarily toggles the guard variable.

## Scheduled events

- `evt_flag_overdue_grants` – Daily job that fills `reportingRequirements` when a grant has passed its `endDate` but no report was recorded.
- `evt_log_stale_drafts` – Weekly job that writes `STALE_DRAFT` entries for papers stuck in Draft for more than 30 days.

The script enables the MySQL event scheduler so these run automatically; you can verify with `SHOW EVENTS`.

## Roles & permissions

Roles mirror application personas:

| Role | EXECUTE permissions |
| --- | --- |
| `role_research_admin` | All procedures (full control). |
| `role_principal_investigator` | Create/update paper + authors, read overviews. |
| `role_contributor` | Record revisions and read overviews. |
| `role_viewer` | Read-only access via `sp_get_paper_overview`. |

Sample users (`papertrail_admin`, `papertrail_pi`, `papertrail_contrib`, `papertrail_viewer`) are created and assigned the appropriate default role. The script now generates unique temporary passwords (unless you provide session variables named `@papertrail_admin_password`, etc.), expires them immediately, and prints the generated values so you can rotate them right after execution. Replace or extend these for real deployments.

## How to demo CRUD for grading

1. Call `CALL sp_create_paper(...);` to show CREATE, then immediately query `ActivityLog` to display the audit row.
2. Use `CALL sp_get_paper_overview(<id>);` in Adminer/MySQL CLI for the READ portion (the multiple result sets show metadata + related records).
3. Demonstrate UPDATE and DELETE with `sp_update_paper_status` and `sp_soft_delete_paper` (showing `ActivityLog` entries afterward).
4. For stored routines tied to relationships, call `sp_assign_author`, `sp_add_grant_to_paper`, and `sp_record_revision` to prove authorship, grant links, and revisions all flow through the database layer.

Keep this file handy during the video walkthrough so you can explain exactly which routine corresponds to each rubric item.
