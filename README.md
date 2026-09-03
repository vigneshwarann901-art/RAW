# RAW — Reusable & Recoverable Network

RAW is a circular-material marketplace for donors and seekers. It combines local discovery, two-sided requirements, explainable matching, AI-assisted material workflows, negotiation, transactions and impact tracking.

## Current build

This repository is a responsive React + TypeScript Vite web app with a local demo mode and optional Supabase integration.

### Stack
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase Auth / Postgres / optional Realtime
- LocalStorage fallback for hackathon demos

### Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Restart Vite.

Without Supabase variables, RAW runs in demo mode using seeded data and LocalStorage. With Supabase configured, sign-in/sign-up and listing/requirement persistence use the real database.

## Demo flow

Donor → List RAW → AI material scan → smart pricing → publish → seeker requirement → RAW Match → offer → transaction → impact.

## Team model

Keep the frontend in `src/`, domain services under `src/services`, reusable state in `src/store`, shared types in `src/types`, and database changes in `supabase/`.


## V6 — Intelligence + realtime

V6 adds the next hackathon milestone:

- circularity-aware RAW Match scoring
- urgency-aware ranking
- best-next-life pathway: direct reuse, repair + reuse, repurpose, recycle
- persisted match records in Supabase
- realtime subscriptions for marketplace activity
- notification storage + notification center
- seeded notification demo experience

The matching engine remains transparent and deterministic so the team can explain every recommendation during judging. AI services are isolated so a real vision/pricing model can be plugged in later without rewriting the UI.
