# RAW MVP v14 — Windows Setup

## 1. Frontend

Open PowerShell in the project folder and run:

```powershell
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## 2. Supabase

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Do not add `sb_secret_...` or `service_role` keys to the browser app.

Run `supabase/schema.sql` once in the Supabase SQL Editor.

## 3. Google sign-in

In Supabase: Authentication → Providers → Google → enable Google and enter the Google OAuth Client ID/Secret.

In Google Cloud OAuth Client settings, add the exact Supabase callback URL shown by Supabase.

For local testing, add `http://localhost:5173` to the Supabase Auth URL configuration / allowed site URL, and add the Vite URL to additional redirect URLs as required.

## 4. RAW API backend

Keep the Vite terminal running. Open a second PowerShell in the same folder:

```powershell
npm run server
```

API base: `http://localhost:5000/api`

Try:
- `http://localhost:5000/api/health`
- `http://localhost:5000/api/listings`
- `http://localhost:5000/api/stats`

The local backend stores demo data in `server/data/raw-data.json`.

## 5. The important demo flow

Donor → create/list material → Seeker requirement → `/api/match` → ranked match score → offer/transaction UI → impact.
