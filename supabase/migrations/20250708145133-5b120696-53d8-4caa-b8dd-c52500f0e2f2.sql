-- Fix RLS policies and create proper organization setup
-- First, let's add a function to handle organization creation with proper UUID

-- Drop existing problematic policies that might cause recursion
DROP POLICY IF EXISTS "organization_members_safe_policy" ON organization_members;

-- Create a function to ensure proper organization setup for new users
CREATE OR REPLACE FUNCTION public.ensure_user_has_valid_organization(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
  v_existing_org_id uuid;
BEGIN
  -- Check if user already has a valid organization
  SELECT organization_id INTO v_existing_org_id
  FROM organization_members 
  WHERE user_id = p_user_id 
  LIMIT 1;
  
  IF v_existing_org_id IS NOT NULL THEN
    -- Check if the organization exists
    IF EXISTS (SELECT 1 FROM organizations WHERE id = v_existing_org_id) THEN
      RETURN v_existing_org_id;
    END IF;
  END IF;
  
  -- Create a new organization for the user
  INSERT INTO organizations (name, slug)
  VALUES ('My Organization', 'org-' || substr(gen_random_uuid()::text, 1, 8))
  RETURNING id INTO v_org_id;
  
  -- Add user as owner of the organization
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org_id, p_user_id, 'owner')
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  
  -- Update user's default organization
  UPDATE profiles 
  SET default_organization_id = v_org_id 
  WHERE id = p_user_id;
  
  RETURN v_org_id;
END;
$$;

-- Create a safer function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id(p_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- First try to get from profile's default organization
  SELECT default_organization_id INTO v_org_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If not found or invalid, ensure user has valid organization
  IF v_org_id IS NULL OR NOT EXISTS (SELECT 1 FROM organizations WHERE id = v_org_id) THEN
    v_org_id := ensure_user_has_valid_organization(p_user_id);
  END IF;
  
  RETURN v_org_id;
END;
$$;