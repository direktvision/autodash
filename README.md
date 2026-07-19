# TA Auto — Content Dashboard

Content planning and production tracking for TA Auto: 5 pieces a week across
TikTok, Instagram and Facebook, spanning three pillars (docuseries, showcase,
conversion).

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel.

## Setup

### 1. Database

Open the Supabase dashboard → **SQL Editor** → **New query**, paste the whole of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run
it. That creates the enums, four tables plus a `settings` row, the seven seeded
vlog segments, and the RLS policies.

### 2. Environment

`.env.local` is already populated with the project URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=      # unused by the app today
```

The service role key is listed in the brief but nothing server-side needs it
yet — every query runs through the anon role. Leave it blank until something
actually requires elevated access.

### 3. Run

```bash
npm install
npm run dev
```

## Deploying

```bash
npx vercel            # link the project
npx vercel --prod
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel
project's environment variables (Production + Preview). No build config needed.

## Architecture

- **Reads** happen in server components via `src/lib/queries.ts`.
- **Writes** are server actions in `src/lib/actions.ts`, which call
  `revalidatePath` so the planner and dashboard stay in sync after a mutation.
- Every page is `force-dynamic` — this is a live planning tool, and stale
  content is worse than a round-trip.

### ISO weeks

`src/lib/dates.ts` is the single source of truth for week maths. Two things it
handles that naive implementations get wrong:

- The ISO week-year is not the calendar year. 2027-01-01 falls in week 53 of ISO
  year **2026**, and the planner has to agree with that or items vanish.
- "Today" resolves against `Europe/Oslo`, not the host clock. Vercel runs in
  UTC, which would otherwise roll the week over at the wrong hour.

Setting a post date re-derives `year`/`week_number` in `updateItem`, so the
scheduled date and the planner week can never disagree.

## Known gaps

- **No auth.** RLS grants the anon role full read/write, and the anon key ships
  to the browser — anyone with the URL can read and write everything. Fine for a
  single-user tool on an unpublished URL; replace the policies in the migration
  with `auth.uid()`-scoped ones before this holds anything sensitive.
- **Metrics are a snapshot, not a time series.** There's a unique index on
  `(content_item_id, platform)` and logging upserts, so re-logging a platform
  overwrites the previous numbers. `logged_at` records the last write. Tracking
  growth over time would mean dropping that index and aggregating the latest row
  per platform.
- **Bank → week promotion is buttons, not drag-and-drop** ("This week" / "Next
  week"), and shot list reordering uses up/down arrows. Both are deliberate: the
  primary device is a phone held one-handed at a dealership, where drag targets
  are unreliable.
