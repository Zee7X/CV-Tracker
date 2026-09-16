# CV Tracker

> A simple, fast web application for job seekers to build professional CVs and track job applications in one organized place.

## Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: Accessible primitives inspired by [shadcn/ui](https://ui.shadcn.com/)
- **Form Management & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Row Level Security, Storage)

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
# Navigate to project directory
cd C:/laragon/www/cv-tracker

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

| Variable Name | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase Publishable API Key | `sb_publishable_...` |

> **Note**: The public landing page and client/server helpers fail safely if these variables are not configured yet, allowing local preview and static verification.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Available Scripts

- `npm run dev` — Start the local development server with Hot Module Reloading.
- `npm run build` — Build the Next.js production bundle.
- `npm run start` — Start the Next.js production server.
- `npm run lint` — Run ESLint static code checks.
- `npm test` — Run focused foundation and validation tests.

### 5. Local Validation (No Supabase Required)

The following commands validate the codebase without requiring a configured Supabase project:

```bash
npm run lint   # ESLint checks: 0 errors expected
npm test       # 13 test suites: schemas, security, accessibility, templates, PDF
npm run build  # Next.js production build: 18 routes expected
```

All tests use mock data and validate structure, security patterns, accessibility, and business logic. Real Supabase credentials are **not required** for automated validation.

### 6. Manual Testing (Requires Supabase Project)

To test the full application with authentication and database operations:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run migrations**: Execute all SQL files in `supabase/migrations/` via the Supabase SQL Editor (in numbered order)
3. **Configure `.env.local`**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. **Start dev server**: `npm run dev`
5. **Manual test paths**:
   - Register → Email confirmation → Login
   - Dashboard → Create CV → Fill sections → Preview → PDF export
   - Applications → Create → Link CV → Update status → Search/filter
   - Logout → Session expiry handling

---

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx         # Root layout with fonts & global styles
│   ├── page.tsx           # Public landing page (Hero, How It Works, Features, Templates, CTA, Footer)
│   └── globals.css        # Tailwind CSS 4 theme and base styling
├── components/
│   └── ui/                # Accessible UI primitives (Button, Card, Badge, Input)
├── lib/
│   ├── supabase/          # Supabase client, server, and proxy utilities
│   │   ├── client.ts      # Browser-side Supabase client (cookie-backed)
│   │   ├── server.ts      # Server-side Supabase client (async cookies)
│   │   ├── proxy.ts       # Session refresh and route protection
│   │   └── middleware.ts  # Compatibility export
│   ├── validations/       # Zod schemas for CV and Application entities
│   │   ├── cv.ts          # Personal info, experience, education, skills, CV schemas
│   │   └── application.ts # Job application form schema and status enum
│   ├── env.ts             # Safe environment helper
│   └── utils.ts           # Classnames utility (clsx + tailwind-merge)
├── types/
│   ├── database.ts        # Supabase PostgreSQL schema types
│   ├── cv.ts              # Domain types for CVs, sections, and templates
│   └── application.ts     # Domain types for applications and status pipeline
├── proxy.ts               # Next.js 16 proxy convention for auth & session management
└── .env.example           # Documented safe environment variables example
```

---

## MVP Scope Summary

- **CV Builder**:
  - Personal information, Summary, Experience, Education, Skills, Projects, Certifications.
  - 3 Core Templates: `ats` (single-column ATS-friendly), `professional` (balanced corporate), `modern` (visual header & sidebar layout).
  - Live preview & A4 PDF export (Wave 1 foundation ready).
- **Job Application Tracker**:
  - Track Company, Position, Applied Date, Status (`applied`, `screening`, `interview`, `offering`, `accepted`, `rejected`), Linked CV, Job URL, Notes.
- **Out of Scope for MVP**:
  - No AI assistant, no ATS score estimation, no automated job scraping, no social feeds.
