-- ============================================================================
-- IQRAF 2.0 — Cross-account data leak corrective migration
-- Fixes RLS / tenant isolation for: assessments, assessment_collaborators, risk_library
-- Target: Supabase Postgres. Roles: anon (unauth), authenticated (logged-in).
-- Idempotent / re-runnable. Wrap in a single transaction so a partial failure
-- rolls back rather than leaving the DB half-secured.
--
-- HOW TO APPLY: paste this whole file into the Supabase SQL Editor of the
-- project your LIVE app actually connects to, and Run. (Confirm which project
-- that is via DevTools -> Network -> the *.supabase.co host on any request.)
-- Safe to run more than once.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Guard: ensure the three tables exist before we touch them.
--    (Fails loudly & rolls back if a table name is wrong, rather than silently
--     "securing" nothing.)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  missing text;
BEGIN
  SELECT string_agg(t, ', ')
    INTO missing
  FROM (VALUES ('assessments'), ('assessment_collaborators'), ('risk_library')) AS v(t)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = v.t AND c.relkind = 'r'
  );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'Aborting migration: missing expected table(s) in schema public: %', missing;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. CLEAN SLATE: drop ALL existing policies on the three tables.
--    Hardcoded DROP lists miss unknown/legacy permissive policies (e.g. a
--    leftover "Enable read access for all users" with USING(true)). Because
--    Postgres OR-combines PERMISSIVE policies, a single surviving USING(true)
--    re-opens the leak. Loop pg_policies so EVERYTHING is removed first.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('assessments', 'assessment_collaborators', 'risk_library')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 2. ENABLE Row Level Security on all THREE tables (risk_library was missing).
--    ENABLE is the minimum and is sufficient for API-path isolation: PostgREST
--    connects as anon/authenticated (non-owner) and is always subject to RLS.
--    FORCE is intentionally NOT applied so service_role / table-owner admin and
--    edge-function maintenance keep working.
-- ----------------------------------------------------------------------------
ALTER TABLE public.assessments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_library             ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. GRANTS — lock down anon, grant authenticated only what the client needs.
--    First REVOKE from PUBLIC + anon on all three (neutralize Supabase default
--    table grants and any stray grant), then re-grant to authenticated.
--    RLS still scopes every authenticated action to the caller's own rows.
-- ----------------------------------------------------------------------------

-- anon (unauthenticated) gets ZERO table access on all three tables.
REVOKE ALL ON TABLE public.assessments              FROM anon;
REVOKE ALL ON TABLE public.assessment_collaborators FROM anon;
REVOKE ALL ON TABLE public.risk_library             FROM anon;

-- Neutralize default PUBLIC grants as defense-in-depth before re-granting.
REVOKE ALL ON TABLE public.assessments              FROM PUBLIC;
REVOKE ALL ON TABLE public.assessment_collaborators FROM PUBLIC;
REVOKE ALL ON TABLE public.risk_library             FROM PUBLIC;

-- assessments: authenticated may SELECT / INSERT / DELETE (RLS scopes them).
-- DELETE stays granted at table level; RLS limits it to the owner only.
GRANT SELECT, INSERT, DELETE ON TABLE public.assessments TO authenticated;
-- NOTE on UPDATE: we keep a TABLE-WIDE UPDATE grant (NOT column-scoped) on
-- purpose. The owner's manual "Save to Cloud" path (AssessmentWizard.tsx
-- saveToCloud, ~L159-171) sends user_id in its UPDATE payload; a column grant
-- that omits user_id would make Postgres reject that statement with
-- "permission denied for column user_id" and break the owner's save. Ownership
-- immutability is instead enforced authoritatively by the BEFORE UPDATE trigger
-- in section 4, which pins user_id = OLD.user_id for everyone (owner no-op,
-- collaborator hijack neutralized) without needing any client change.
GRANT UPDATE ON TABLE public.assessments TO authenticated;

-- assessment_collaborators: authenticated may SELECT / INSERT / DELETE
-- (no UPDATE — the client never updates collaborator rows). RLS scopes them.
GRANT SELECT, INSERT, DELETE ON TABLE public.assessment_collaborators TO authenticated;

-- risk_library: authenticated may SELECT / INSERT / DELETE
-- (client never UPDATEs library rows). RLS makes all of them owner-scoped.
GRANT SELECT, INSERT, DELETE ON TABLE public.risk_library TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. OWNERSHIP-IMMUTABILITY TRIGGER on assessments (anti-hijack).
--    RLS WITH CHECK cannot reference OLD, so it cannot enforce "user_id
--    unchanged". A collaborator's UPDATE could set user_id = their own uid and
--    still satisfy the collaborator WITH CHECK, stealing ownership. This trigger
--    forces NEW.user_id back to OLD.user_id on every UPDATE, so no UPDATE path
--    (collaborator OR owner) can ever change the owner. Idempotent via
--    CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS.
--    SET search_path = '' satisfies the Supabase function-search-path linter;
--    the body references no tables so it is purely hygienic.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.iqraf_pin_assessment_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Owner of a row can never be changed via UPDATE. Silently re-pin so the
  -- owner's existing saveToCloud payload (which re-sends the same user_id)
  -- is a harmless no-op, while a collaborator's attempt to set a new owner
  -- is neutralized.
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS iqraf_pin_assessment_owner_trg ON public.assessments;
CREATE TRIGGER iqraf_pin_assessment_owner_trg
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.iqraf_pin_assessment_owner();

-- ----------------------------------------------------------------------------
-- 5. ASSESSMENTS POLICIES
-- ----------------------------------------------------------------------------

-- 5a. Owner has FULL access (SELECT / INSERT / UPDATE / DELETE) to own rows.
--     WITH CHECK pins user_id on INSERT so a user cannot create a row owned by
--     someone else. This FOR ALL policy is also the ONLY DELETE path -> DELETE
--     is owner-only (collaborators have no DELETE/ALL policy, see 5b/5c).
CREATE POLICY "assessments_owner_all" ON public.assessments
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 5b. Collaborator may SELECT assessments they are invited to.
--     Email matched case-insensitively, with empty/NULL JWT email guarded out.
CREATE POLICY "assessments_collaborator_select" ON public.assessments
  FOR SELECT TO authenticated
  USING (
    nullif(trim((select auth.jwt()) ->> 'email'), '') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.assessment_collaborators ac
      WHERE ac.assessment_id = public.assessments.id
        AND lower(ac.email) = lower((select auth.jwt()) ->> 'email')
    )
  );

-- 5c. Collaborator may UPDATE (content only) assessments they are invited to.
--     The ownership-immutability trigger (section 4) prevents the collaborator
--     from changing user_id, so this UPDATE is content-only and cannot hijack.
--     No collaborator DELETE policy exists, so collaborators cannot delete.
CREATE POLICY "assessments_collaborator_update" ON public.assessments
  FOR UPDATE TO authenticated
  USING (
    nullif(trim((select auth.jwt()) ->> 'email'), '') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.assessment_collaborators ac
      WHERE ac.assessment_id = public.assessments.id
        AND lower(ac.email) = lower((select auth.jwt()) ->> 'email')
    )
  )
  WITH CHECK (
    nullif(trim((select auth.jwt()) ->> 'email'), '') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.assessment_collaborators ac
      WHERE ac.assessment_id = public.assessments.id
        AND lower(ac.email) = lower((select auth.jwt()) ->> 'email')
    )
  );

-- ----------------------------------------------------------------------------
-- 6. ASSESSMENT_COLLABORATORS POLICIES
-- ----------------------------------------------------------------------------

-- 6a. Invited user may SELECT their own invite row (self-view).
--     This also backs the EXISTS sub-selects in the assessments collaborator
--     policies. Case-insensitive, empty/NULL JWT email guarded out.
CREATE POLICY "collaborators_view_own_invite" ON public.assessment_collaborators
  FOR SELECT TO authenticated
  USING (
    nullif(trim((select auth.jwt()) ->> 'email'), '') IS NOT NULL
    AND lower(email) = lower((select auth.jwt()) ->> 'email')
  );

-- 6b. Owner of the parent assessment may manage (SELECT/INSERT/DELETE) its
--     collaborator rows. Explicit WITH CHECK mirrors USING so a non-owner
--     cannot INSERT a self-invite onto someone else's assessment.
CREATE POLICY "collaborators_owner_manage" ON public.assessment_collaborators
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = public.assessment_collaborators.assessment_id
        AND a.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = public.assessment_collaborators.assessment_id
        AND a.user_id = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- 7. RISK_LIBRARY POLICIES — strictly owner-only for every command.
--    USING scopes SELECT/UPDATE/DELETE to own rows; WITH CHECK forces
--    user_id = auth.uid() on INSERT/UPDATE so a user cannot create or relabel
--    rows owned by another account. The client's unfiltered
--    `select('*').eq('category', ...)` and `delete().eq('id', ...)` become
--    transparently owner-scoped.
-- ----------------------------------------------------------------------------
CREATE POLICY "risk_library_owner_all" ON public.risk_library
  FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

COMMIT;

-- ============================================================================
-- 8. OPTIONAL POST-DEPLOY VERIFICATION (run manually; not part of the txn)
-- ============================================================================
-- RLS enabled on all three (rls_enabled should be true; rls_forced false is fine):
--   SELECT relname, relrowsecurity AS rls_enabled, relforcerowsecurity AS rls_forced
--   FROM pg_class
--   WHERE relname IN ('assessments','assessment_collaborators','risk_library');
--
-- Exactly the intended policies present, nothing permissive left over:
--   SELECT tablename, policyname, cmd, roles
--   FROM pg_policies
--   WHERE tablename IN ('assessments','assessment_collaborators','risk_library')
--   ORDER BY tablename, policyname;
--
-- Ownership-pin trigger is installed (security-critical — must exist):
--   SELECT tgname FROM pg_trigger
--   WHERE tgrelid = 'public.assessments'::regclass
--     AND tgname = 'iqraf_pin_assessment_owner_trg';
--
-- anon has no privileges; authenticated has the intended ones:
--   SELECT grantee, table_name, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_name IN ('assessments','assessment_collaborators','risk_library')
--     AND grantee IN ('anon','authenticated','PUBLIC')
--   ORDER BY table_name, grantee, privilege_type;
-- ============================================================================
