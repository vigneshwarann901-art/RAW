# RAW MVP v6

## V6 focus
- Circularity-aware matching with urgency and best-next-life pathway.
- Persisted match records in Supabase using a unique resource/requirement pair.
- Realtime subscriptions for listings, requirements, offers, transactions and notifications.
- Notification center in the authenticated application shell.
- Supabase notification table and realtime publication setup.

## Demo behavior
When Supabase is unavailable, RAW remains fully usable in local demo mode with localStorage and seeded notifications. When Supabase is configured, repository methods persist the core objects and realtime refreshes keep the UI current.
