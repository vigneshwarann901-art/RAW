# RAW API

The API is a small modular Node HTTP server backed by Supabase PostgreSQL.

## Authentication

Every protected request must send:

```http
Authorization: Bearer <Supabase access token>
```

The API calls Supabase Auth `getUser(access_token)` to validate the session before running database queries. Database queries run with the user's JWT so PostgreSQL Row Level Security still applies.

Google and email passwords are never stored by RAW. Supabase Auth owns credential storage.

## Routes

```text
GET    /api/health
GET    /api/me
PATCH  /api/profile
GET    /api/listings
POST   /api/listings
GET    /api/requirements
POST   /api/requirements
GET    /api/matches
GET    /api/offers?role=DONOR|SEEKER
POST   /api/offers
PATCH  /api/offers/:id
GET    /api/transactions
PATCH  /api/transactions/:id
GET    /api/notifications
PATCH  /api/notifications/:id
GET    /api/stats
```

The optional `SUPABASE_SECRET_KEY` is used only for server-generated notifications. It must never have a `VITE_` prefix.
