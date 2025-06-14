
-- First, let's see which organizations don't have active subscriptions
-- and assign them the free plan

WITH organizations_without_subscriptions AS (
  SELECT o.id as organization_id
  FROM organizations o
  LEFT JOIN organization_subscriptions os ON o.id = os.organization_id 
    AND os.status = 'active'
  WHERE os.id IS NULL
),
free_plan AS (
  SELECT id FROM subscription_plans 
  WHERE name = 'free' AND is_active = true 
  LIMIT 1
)
INSERT INTO organization_subscriptions (
  organization_id,
  subscription_plan_id,
  status,
  current_period_start,
  current_period_end
)
SELECT 
  ows.organization_id,
  fp.id,
  'active',
  now(),
  now() + interval '1 year' -- Free plan gets 1 year period
FROM organizations_without_subscriptions ows
CROSS JOIN free_plan fp;

-- Let's also see a summary of what we just did
SELECT 
  'Organizations assigned free plan' as action,
  COUNT(*) as count
FROM organizations o
LEFT JOIN organization_subscriptions os ON o.id = os.organization_id 
WHERE os.subscription_plan_id = (
  SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1
)
AND os.created_at >= now() - interval '1 minute';
