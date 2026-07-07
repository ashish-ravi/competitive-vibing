-- NextAuth v5 Supabase adapter schema (official @auth/supabase-adapter SQL)
-- plus the app's public.users table, kept in sync via trigger.
--
-- NOTE: after running this migration, expose the "next_auth" schema in
-- Supabase Dashboard → Settings → API → "Exposed schemas" so the adapter
-- can reach it through PostgREST.

CREATE SCHEMA IF NOT EXISTS next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO service_role;

--
-- next_auth.users
--
CREATE TABLE IF NOT EXISTS next_auth.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  email text,
  "emailVerified" timestamptz,
  image text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT email_unique UNIQUE (email)
);

-- uid() helper for RLS policies driven by a NextAuth-signed Supabase JWT.
-- V1 does not issue client-side Supabase JWTs, so this exists for parity with
-- the official adapter schema and future use.
CREATE OR REPLACE FUNCTION next_auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

--
-- next_auth.sessions
--
CREATE TABLE IF NOT EXISTS next_auth.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  expires timestamptz NOT NULL,
  "sessionToken" text NOT NULL,
  "userId" uuid,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessiontoken_unique UNIQUE ("sessionToken"),
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES next_auth.users (id) ON DELETE CASCADE
);

--
-- next_auth.accounts
--
CREATE TABLE IF NOT EXISTS next_auth.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  oauth_token_secret text,
  oauth_token text,
  "userId" uuid,
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES next_auth.users (id) ON DELETE CASCADE
);

--
-- next_auth.verification_tokens
--
CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
  identifier text,
  token text,
  expires timestamptz NOT NULL,
  CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
  CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

--
-- public.users — application-facing user table (spec: docs/architecture.md)
-- All app FKs point here. Synced from next_auth.users by trigger.
--
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own row"
  ON public.users FOR SELECT
  USING (id = next_auth.uid());

CREATE POLICY "users can update own row"
  ON public.users FOR UPDATE
  USING (id = next_auth.uid());

--
-- Sync trigger: mirror next_auth.users into public.users
--
CREATE OR REPLACE FUNCTION public.sync_next_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.email, ''), NEW.name, NEW.image)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_next_auth_user_change ON next_auth.users;
CREATE TRIGGER on_next_auth_user_change
  AFTER INSERT OR UPDATE ON next_auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_next_auth_user();
