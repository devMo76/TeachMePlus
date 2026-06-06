# AcadMate

AcadMate is a Next.js and Supabase full-stack web application for a verified student-to-senior tutoring marketplace.

## Tech Stack

- Next.js 14+ with App Router and `src/`
- TypeScript strict mode
- Supabase Auth, PostgreSQL, and Storage
- Tailwind CSS

## Setup

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase values.
4. Start Supabase locally with `supabase start`.
5. Run the development server with `npm run dev`.

## Folder Structure

- `src/app/` contains App Router routes split by public, auth, student, tutor, and admin route groups.
- `src/components/` contains reusable presentational JSX components only.
- `src/features/` contains feature-based actions, queries, validations, and helpers.
- `src/lib/` contains shared Supabase clients, constants, validations, utilities, and permissions.
- `src/types/` contains shared TypeScript type definitions.
- `supabase/` contains local Supabase config, migrations, and seed data.

See `docs/` for product requirements, database notes, user flows, security rules, roadmap, and Codex prompt history.
