-- 1. Clean up all existing policies to start fresh
DROP POLICY IF EXISTS "Allow_All_Access_Assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow_All_Access_Collaborators" ON public.assessment_collaborators;
DROP POLICY IF EXISTS "assessments_owner_all" ON public.assessments;
DROP POLICY IF EXISTS "assessments_collaborator_view" ON public.assessments;
DROP POLICY IF EXISTS "assessments_collaborator_update" ON public.assessments;
DROP POLICY IF EXISTS "collaborators_owner_manage" ON public.assessment_collaborators;
DROP POLICY IF EXISTS "collaborators_view_self" ON public.assessment_collaborators;
DROP POLICY IF EXISTS "assessments_owner_policy" ON public.assessments;
DROP POLICY IF EXISTS "assessments_collaborator_select_policy" ON public.assessments;
DROP POLICY IF EXISTS "assessments_collaborator_update_policy" ON public.assessments;
DROP POLICY IF EXISTS "collaborators_self_select" ON public.assessment_collaborators;

-- 2. Ensure RLS is enabled on both tables
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_collaborators ENABLE ROW LEVEL SECURITY;

-- 3. Revoke all access from the 'anon' (unauthenticated) role for safety
REVOKE ALL ON TABLE public.assessments FROM anon;
REVOKE ALL ON TABLE public.assessment_collaborators FROM anon;

-- 4. Grant necessary permissions to the 'authenticated' role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.assessment_collaborators TO authenticated;

-- 5. Assessments Table Policies
-- Policy: Owners have full access to their own assessments
CREATE POLICY "assessments_owner_access" ON public.assessments
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Collaborators can VIEW assessments they are invited to
-- We use the email from the user's JWT to match the collaborator record
CREATE POLICY "assessments_collaborator_select" ON public.assessments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_collaborators
    WHERE assessment_id = public.assessments.id
    AND email = auth.jwt() ->> 'email'
  )
);

-- Policy: Collaborators can UPDATE assessments they are invited to
CREATE POLICY "assessments_collaborator_update" ON public.assessments
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_collaborators
    WHERE assessment_id = public.assessments.id
    AND email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assessment_collaborators
    WHERE assessment_id = public.assessments.id
    AND email = auth.jwt() ->> 'email'
  )
);

-- 6. Collaborators Table Policies
-- Policy: Users can see their own collaborator entries (required for the 'EXISTS' check above)
CREATE POLICY "collaborators_view_own_invite" ON public.assessment_collaborators
FOR SELECT TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Policy: Owners can manage (CRUD) collaborators for their own assessments
CREATE POLICY "collaborators_owner_manage" ON public.assessment_collaborators
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assessments
    WHERE id = public.assessment_collaborators.assessment_id
    AND user_id = auth.uid()
  )
);