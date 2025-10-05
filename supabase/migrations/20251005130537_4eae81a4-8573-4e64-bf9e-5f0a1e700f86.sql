-- Phase 1: Critical Security Fixes
-- 1.1 & 1.2: Implement Proper Role-Based Access Control

-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Create user_roles table (separate from organization_members)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _org_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  );
$$;

-- Create security definer function to check if user is org member
CREATE OR REPLACE FUNCTION public.is_org_member_secure(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
  );
$$;

-- Create security definer function to check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner_secure(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role IN ('admin', 'owner')
  );
$$;

-- Create security definer function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role_secure(_org_id UUID, _user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND organization_id = _org_id
  ORDER BY 
    CASE role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'member' THEN 3
      WHEN 'viewer' THEN 4
    END
  LIMIT 1;
$$;

-- Migrate existing roles from organization_members to user_roles
-- Only migrate valid users that exist in auth.users and valid organizations
INSERT INTO public.user_roles (user_id, organization_id, role, created_at, updated_at)
SELECT 
  om.user_id,
  om.organization_id,
  om.role::text::app_role,
  om.created_at,
  om.updated_at
FROM public.organization_members om
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE id = om.user_id
)
AND EXISTS (
  SELECT 1 FROM public.organizations WHERE id = om.organization_id
)
ON CONFLICT (user_id, organization_id, role) DO NOTHING;

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Organization admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (is_org_admin_or_owner_secure(organization_id, auth.uid()));

CREATE POLICY "Only admins and owners can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  is_org_admin_or_owner_secure(organization_id, auth.uid())
  AND (
    -- Owners can assign any role
    has_role(auth.uid(), organization_id, 'owner'::app_role)
    OR
    -- Admins can only assign member/viewer roles
    (has_role(auth.uid(), organization_id, 'admin'::app_role) AND role IN ('member', 'viewer'))
  )
);

CREATE POLICY "Only admins and owners can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  is_org_admin_or_owner_secure(organization_id, auth.uid())
  AND (
    -- Owners can update any role
    has_role(auth.uid(), organization_id, 'owner'::app_role)
    OR
    -- Admins cannot modify owner/admin roles
    (has_role(auth.uid(), organization_id, 'admin'::app_role) AND role IN ('member', 'viewer'))
  )
);

CREATE POLICY "Only owners can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), organization_id, 'owner'::app_role)
  AND user_id != auth.uid() -- Cannot remove own role
);

-- 1.1: Fix privilege escalation by dropping dangerous policies on organization_members
DROP POLICY IF EXISTS "Users can insert own memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.organization_members;

-- Keep organization_members for backward compatibility but lock it down
-- Only allow viewing, all role management goes through user_roles
CREATE POLICY "Members can view organization membership"
ON public.organization_members
FOR SELECT
TO authenticated
USING (is_org_member_secure(organization_id, auth.uid()));

-- Update handle_new_user trigger to use user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create organization
  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(new.raw_user_meta_data->>'organization_name', 'My Organization'),
    COALESCE(new.raw_user_meta_data->>'organization_slug', 'org-' || gen_random_uuid())
  )
  RETURNING id INTO new_org_id;

  -- Create profile
  INSERT INTO public.profiles (id, username, full_name, avatar_url, default_organization_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new_org_id
  );

  -- Add to organization_members (for backward compatibility)
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, new.id, 'owner');

  -- Add role to user_roles (new secure table)
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (new.id, new_org_id, 'owner');

  RETURN NEW;
END;
$$;