# RAW — Reusable & Recoverable Network

RAW connects surplus materials with nearby demand using structured listings, requirements and compatibility scoring.

## Architecture

- React + TypeScript + Vite frontend
- Supabase Auth for email/password and Google OAuth
- Node.js HTTP API with `@supabase/supabase-js`
- PostgreSQL via Supabase
- Row Level Security for user-scoped access
- Realtime subscriptions for listings, requirements, offers, transactions and notifications
- Explainable matching using material, quantity, price, distance, availability, trust, circularity and urgency

## Core flow

```text
Google/email authentication
        ↓
Supabase Auth session
        ↓
RAW API verifies user token
        ↓
Profile + database access
        ↓
Listing / requirement
        ↓
Matching
        ↓
Offer + notification
        ↓
Accepted transaction
        ↓
Completion + impact record + receipt
```

### Security note

RAW never stores Google or email passwords in the application database. Supabase Auth is responsible for credentials. The `profiles.id` is the signed-in Supabase Auth user ID. The Node API validates the Supabase access token before data access.

## Windows setup

See [`SETUP-WINDOWS-FULLSTACK.md`](./SETUP-WINDOWS-FULLSTACK.md).

## Commands

```powershell
npm install
npm run server
npm run dev
npm run build
npm run typecheck
```

The local frontend proxies `/api` to `http://localhost:5000` through `vite.config.ts`.
