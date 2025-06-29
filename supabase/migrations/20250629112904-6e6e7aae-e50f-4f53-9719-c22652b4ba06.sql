
-- Create security definer functions to prevent RLS recursion

-- Function to get user's role in an organization
CREATE OR REPLACE FUNCTION public.get_user_org_role(p_org_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role
  FROM public.organization_members
  WHERE organization_id = p_org_id AND user_id = p_user_id;
  
  RETURN user_role;
END;
$$;

-- Function to check if user is organization member
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.organization_members 
    WHERE organization_id = p_org_id AND user_id = p_user_id
  );
END;
$$;

-- Function to check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(p_org_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.organization_members 
    WHERE organization_id = p_org_id 
    AND user_id = p_user_id 
    AND role IN ('admin', 'owner')
  );
END;
$$;

-- Function to get current user's organizations
CREATE OR REPLACE FUNCTION public.get_current_user_organizations()
RETURNS TABLE(organization_id uuid, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id, om.role::text
  FROM public.organization_members om
  WHERE om.user_id = auth.uid();
END;
$$;

-- Now create RLS policies for organization_members table
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can manage organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can manage all organization members" ON public.organization_members;

-- Policy for SELECT: Users can view members of organizations they belong to
CREATE POLICY "Users can view org members"
ON public.organization_members
FOR SELECT
TO authenticated
USING (
  public.is_org_member(organization_id, auth.uid())
);

-- Policy for INSERT: Only admins and owners can add new members
CREATE POLICY "Admins can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_org_admin_or_owner(organization_id, auth.uid())
);

-- Policy for UPDATE: Only admins and owners can update member roles
-- But owners cannot be demoted by non-owners
CREATE POLICY "Admins can update members"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (
  public.is_org_admin_or_owner(organization_id, auth.uid())
  AND (
    -- Can't demote an owner unless you're an owner
    role != 'owner' OR 
    public.get_user_org_role(organization_id, auth.uid()) = 'owner'
  )
)
WITH CHECK (
  public.is_org_admin_or_owner(organization_id, auth.uid())
  AND (
    -- Can't promote to owner unless you're an owner
    role != 'owner' OR 
    public.get_user_org_role(organization_id, auth.uid()) = 'owner'
  )
);

-- Policy for DELETE: Only admins and owners can remove members
-- But owners cannot be removed by non-owners
CREATE POLICY "Admins can remove members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (
  public.is_org_admin_or_owner(organization_id, auth.uid())
  AND (
    -- Can't remove an owner unless you're an owner
    role != 'owner' OR 
    public.get_user_org_role(organization_id, auth.uid()) = 'owner'
  )
);
