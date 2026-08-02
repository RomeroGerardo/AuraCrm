-- Add subscription tracking fields to the profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS mercadopago_customer_id text,
ADD COLUMN IF NOT EXISTS mercadopago_subscription_id text,
ADD COLUMN IF NOT EXISTS trial_end timestamptz NOT NULL DEFAULT (now() + interval '14 days');

-- Add a comment to the table to explain the new fields
COMMENT ON COLUMN public.profiles.plan_type IS 'The selected plan: free, pro, full';
COMMENT ON COLUMN public.profiles.subscription_status IS 'The status: trialing, active, past_due, canceled';
COMMENT ON COLUMN public.profiles.trial_end IS 'When the 14 day trial expires';
