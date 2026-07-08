-- FIX for "Server error" after Google sign-in.
-- The original migration granted table privileges BEFORE the next_auth tables
-- existed, so service_role ended up with no access and the NextAuth adapter
-- failed with "permission denied for table users".
--
-- Paste this whole file into the Supabase SQL editor and Run (same place you
-- ran the migrations):
-- https://supabase.com/dashboard/project/psfrgmpbiuugssskbjjz/sql/new

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth GRANT ALL ON TABLES TO service_role;

-- Make PostgREST pick up the changes immediately.
NOTIFY pgrst, 'reload schema';
