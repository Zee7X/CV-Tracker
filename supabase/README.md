# Database Schema & Migrations

## Overview

CV Tracker uses Supabase PostgreSQL with Row Level Security (RLS) to ensure data isolation between users.

## Schema

### Tables

- **profiles** — User profile data extending auth.users
- **cvs** — User's curriculum vitae documents
- **cv_experiences** — Work experience entries
- **cv_educations** — Education entries
- **cv_projects** — Project entries
- **cv_certifications** — Certification entries
- **job_applications** — Job application tracking

### Relationships

```
auth.users (Supabase Auth)
    ↓ 1:1
profiles
    ↓
    ├─→ cvs (1:N)
    │    ├─→ cv_experiences
    │    ├─→ cv_educations
    │    ├─→ cv_projects
    │    └─→ cv_certifications
    │
    └─→ job_applications (1:N)
         └─→ cvs (optional reference)
```

### Key Features

1. **Cascade Deletes**: Child records (experiences, educations, projects, certifications) are automatically deleted when parent CV is deleted
2. **Set NULL on CV Delete**: When a CV is deleted, job_applications.cv_id becomes NULL (application preserved)
3. **CV Ownership Constraint**: job_applications can only reference CVs owned by the same user
4. **Auto Profile Creation**: Trigger automatically creates profile when auth.users record is inserted
5. **Auto Timestamps**: updated_at is automatically updated on every record modification

## Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

### Direct Ownership (profiles, cvs, job_applications)

```sql
auth.uid() = user_id
```

### Indirect Ownership (cv_experiences, cv_educations, cv_projects, cv_certifications)

Child records validate ownership through parent CV:

```sql
exists (
  select 1 from public.cvs
  where cvs.id = child_table.cv_id
  and cvs.user_id = auth.uid()
)
```

## Migrations

Migrations are located in `supabase/migrations/` and must be applied in timestamp order.

### Current Migrations

- `20260915000000_init_schema.sql` — Initial schema with all tables, indexes, triggers, and RLS policies

### Running Migrations

If using Supabase CLI:

```bash
supabase db reset  # Reset and run all migrations
```

Or apply directly to your Supabase project via the SQL Editor in the Supabase Dashboard.

## Testing

Run migration validation tests:

```bash
npx tsx --test tests/migration.test.ts
```

Tests validate:
- Table structure
- Foreign key relationships
- Constraints (template, status)
- Indexes
- Triggers
- RLS policies
- Column definitions

All tests run statically against the migration file (no live database required).

## Security Notes

- RLS is mandatory — never disable it
- Child table access is validated through parent ownership
- CV ownership for job_applications is enforced via CHECK constraint
- All policies use `auth.uid()` for user identification
