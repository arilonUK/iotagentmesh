-- Remove orphaned records in organization_members that reference non-existent users
DELETE FROM public.organization_members
WHERE user_id NOT IN (
  SELECT id FROM auth.users
);