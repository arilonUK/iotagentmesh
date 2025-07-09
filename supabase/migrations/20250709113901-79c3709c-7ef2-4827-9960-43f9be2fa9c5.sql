-- Remove foreign key constraint from organization_members to auth.users
-- This constraint causes issues because auth.users is managed by Supabase
-- and should not be directly referenced via foreign keys

-- Drop the foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'organization_members_user_id_fkey'
        AND table_name = 'organization_members'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.organization_members 
        DROP CONSTRAINT organization_members_user_id_fkey;
        
        RAISE NOTICE 'Dropped foreign key constraint organization_members_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint organization_members_user_id_fkey does not exist';
    END IF;
END $$;

-- Add a comment to document why we don't use foreign key to auth.users
COMMENT ON COLUMN public.organization_members.user_id IS 
'References auth.users.id but without FK constraint. Supabase auth.users table should not be directly referenced via foreign keys. Data integrity is maintained through RLS policies and triggers.';

-- Ensure RLS is enabled on organization_members table
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;