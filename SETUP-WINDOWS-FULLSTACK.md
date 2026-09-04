# RAW — Windows Full-Stack Setup

## 1. Install

Open PowerShell in this folder:

```powershell
npm install
```

## 2. Create `.env.local`

Create a file named `.env.local` beside `package.json`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
SUPABASE_SECRET_KEY=sb_secret_YOUR_SERVER_ONLY_KEY
```

The Node API reads the same values from `.env.local`. Never put a Supabase secret key in the browser build.

## 3. Create the database

In the Supabase project open **SQL Editor**, create a new query, paste the complete contents of `supabase/schema.sql`, and run it.

This creates profiles, businesses, listings, requirements, matches, offers, transactions, ratings, impact records and notifications, plus Row Level Security policies and the new-user profile trigger.

## 4. Configure Google login

In Supabase:

**Authentication → Providers → Google**

Enable Google.

In Google Cloud, create a Web OAuth client and add your RAW app as an authorized JavaScript origin.

For local development use:

```text
http://localhost:5173
```

For the Supabase OAuth callback, use the exact callback URI shown by Supabase for your project/provider configuration.

In Supabase **Authentication → URL Configuration**, allow:

```text
http://localhost:5173/auth/login
```

and set the local Site URL to:

```text
http://localhost:5173
```

When deployed, add the production domain and its `/auth/login` redirect URL as allowed URLs too.

## 5. Run the backend

Terminal 1:

```powershell
npm run server
```

Expected:

```text
RAW backend running on http://localhost:5000
Supabase configured; authenticated API routes are enabled.
```

## 6. Run the frontend

Terminal 2:

```powershell
npm run dev
```

Open the local URL Vite prints, normally:

```text
http://localhost:5173
```

## 7. Verify the API

Open:

```text
http://localhost:5000/api/health
```

You should see JSON showing `supabaseConfigured: true`.

The protected APIs require the current Supabase access token in:

```http
Authorization: Bearer <supabase-access-token>
```

The browser client obtains the token from Supabase Auth and the RAW API verifies the token with Supabase Auth before reading/writing user data.

## 8. Authentication architecture

RAW does **not** store Google passwords, Google client secrets, or provider passwords in its own database.

Supabase Auth is the identity system. RAW stores an application `profiles` row keyed by the Supabase Auth user ID. The backend verifies the signed-in user's access token and applies Row Level Security to database operations.

## 9. Production deployment

The frontend can be deployed to Vercel/another static host.

The Node API must run on a server platform (for example Render, Railway, Fly.io, or a VPS) and the deployed frontend should set:

```env
VITE_API_URL=https://YOUR-API-DOMAIN/api
```

On the API host, set:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
PORT=5000
```

Keep the secret key out of the browser and source control.
