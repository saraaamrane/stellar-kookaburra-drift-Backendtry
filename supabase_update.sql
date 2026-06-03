-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow_All_Access_Assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow_All_Access_Collaborators" ON public.assessment_collaborators;

-- Ensure RLS is enabled
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_collaborators ENABLE ROW LEVEL SECURITY;

-- Assessments Policies
-- 1. Owners have full control (Read, Write, Delete)
CREATE POLICY "assessments_owner_all" ON public.assessments
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Collaborators can view assessments they are invited to
CREATE POLICY "assessments_collaborator_view" ON public.assessments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_collaborators
    WHERE assessment_id = public.assessments.id
    AND email = auth.jwt() ->> 'email'
  )
);

-- 3. Collaborators can update assessments they are invited to
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

-- Collaborators Table Policies
-- 1. Owners can manage collaborators for their own assessments
CREATE POLICY "collaborators_owner_manage" ON public.assessment_collaborators
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assessments
    WHERE id = public.assessment_collaborators.assessment_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assessments
    WHERE id = public.assessment_collaborators.assessment_id
    AND user_id = auth.uid()
  )
);

-- 2. Collaborators can see their own invitation entries
CREATE POLICY "collaborators_view_self" ON public.assessment_collaborators
FOR SELECT TO authenticated
USING (email = auth.jwt() ->> 'email');