-- ComplianceIQ — survey_submissions table
-- Run this in the Supabase SQL Editor of a NEW project to recreate the schema
-- the app expects (see app/api/submit/route.ts and app/admin/page.tsx).

create table if not exists public.survey_submissions (
  id              uuid primary key default gen_random_uuid(),
  survey_version  text        not null,
  submission_date timestamptz not null default now(),
  score_generated text        not null,
  company_name    text        not null,
  contact_name    text        not null,
  email           text        not null,
  industry        text        not null,
  responses       jsonb       not null,        -- [{ question, answer, points }]
  score           integer     not null,
  max_score       integer     not null default 80,
  risk_level      text        not null,        -- 'Low Risk' | 'Moderate Risk' | 'High Risk'
  analysis        jsonb,                        -- { strengths, weaknesses, recommendations }
  created_at      timestamptz not null default now()
);

-- Newest-first ordering used by the admin dashboard.
create index if not exists survey_submissions_submission_date_idx
  on public.survey_submissions (submission_date desc);

-- The app connects with the service_role key (server-side only), which bypasses
-- Row Level Security. Enable RLS so the anon/public key cannot read the table.
alter table public.survey_submissions enable row level security;
