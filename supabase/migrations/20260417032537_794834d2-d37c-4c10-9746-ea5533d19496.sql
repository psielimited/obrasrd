
-- =====================================================
-- 1. Fix role self-escalation on user_profiles
-- =====================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('buyer', 'provider')
);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('buyer', 'provider')
);

-- =====================================================
-- 2. Fix provider self-approve verifications
-- =====================================================
DROP POLICY IF EXISTS "Owners can insert own provider verifications" ON public.provider_verifications;
CREATE POLICY "Owners can submit pending verifications"
ON public.provider_verifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.id = provider_verifications.provider_id
      AND p.owner_user_id = auth.uid()
  )
  AND status = 'pending'
  AND verified_at IS NULL
  AND verified_by_user_id IS NULL
);

-- Remove self-update on verifications entirely; only service role can change
DROP POLICY IF EXISTS "Owners can update own provider verifications" ON public.provider_verifications;

-- =====================================================
-- 3. Prevent providers from self-setting verified=true
-- =====================================================
CREATE OR REPLACE FUNCTION public.prevent_provider_self_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow verified flag changes by service_role (e.g., admin via privileged flows)
  IF TG_OP = 'INSERT' THEN
    IF NEW.verified IS TRUE AND auth.role() <> 'service_role' THEN
      NEW.verified := false;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.verified IS DISTINCT FROM OLD.verified AND auth.role() <> 'service_role' THEN
      NEW.verified := OLD.verified;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_provider_self_verify_trg ON public.providers;
CREATE TRIGGER prevent_provider_self_verify_trg
BEFORE INSERT OR UPDATE ON public.providers
FOR EACH ROW
EXECUTE FUNCTION public.prevent_provider_self_verify();

-- =====================================================
-- 4. Fix service_posts WhatsApp exposure
-- =====================================================
ALTER TABLE public.service_posts
  ADD COLUMN IF NOT EXISTS owner_user_id uuid;

-- Backfill owner where possible (no-op if column previously empty/new rows only)
-- Tighten policies
DROP POLICY IF EXISTS "Authenticated can read service posts" ON public.service_posts;
DROP POLICY IF EXISTS "Public can submit service posts" ON public.service_posts;

CREATE POLICY "Owners can read own service posts"
ON public.service_posts
FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

CREATE POLICY "Authenticated can create service posts"
ON public.service_posts
FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can update own service posts"
ON public.service_posts
FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can delete own service posts"
ON public.service_posts
FOR DELETE
TO authenticated
USING (owner_user_id = auth.uid());

-- =====================================================
-- 5. Fix projects unrestricted access
-- =====================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS owner_user_id uuid;

ALTER TABLE public.project_phases
  ADD COLUMN IF NOT EXISTS owner_user_id uuid;

DROP POLICY IF EXISTS "Authenticated can manage projects" ON public.projects;

CREATE POLICY "Owners can read own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

CREATE POLICY "Owners can create own projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can update own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can delete own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated can manage project phases" ON public.project_phases;

CREATE POLICY "Owners can read own project phases"
ON public.project_phases
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_phases.project_id
      AND p.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Owners can insert own project phases"
ON public.project_phases
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_phases.project_id
      AND p.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update own project phases"
ON public.project_phases
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_phases.project_id
      AND p.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_phases.project_id
      AND p.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete own project phases"
ON public.project_phases
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_phases.project_id
      AND p.owner_user_id = auth.uid()
  )
);

-- =====================================================
-- 6. Recreate views as SECURITY INVOKER
-- =====================================================
ALTER VIEW IF EXISTS public.provider_summary_view SET (security_invoker = true);
ALTER VIEW IF EXISTS public.provider_trust_signals SET (security_invoker = true);
ALTER VIEW IF EXISTS public.legacy_category_mapping_report SET (security_invoker = true);
ALTER VIEW IF EXISTS public.legacy_category_mapping_summary SET (security_invoker = true);
ALTER VIEW IF EXISTS public.project_stages SET (security_invoker = true);

-- =====================================================
-- 7. Set immutable search_path on remaining functions
-- =====================================================
ALTER FUNCTION public.enforce_provider_lead_quota() SET search_path = public;
ALTER FUNCTION public.set_lead_timestamps() SET search_path = public;
ALTER FUNCTION public.set_requester_state_timestamps() SET search_path = public;
ALTER FUNCTION public.sync_lead_last_message() SET search_path = public;
ALTER FUNCTION public.enforce_provider_featured_entitlement() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
