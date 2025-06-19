-- Add 'once' as a valid interval option for subscription packages
-- This allows for one-time payments alongside recurring subscriptions

-- First, let's see what constraints exist on the interval column
-- We'll update any existing check constraints or add validation

-- Add a check constraint to allow 'once' as a valid interval
-- Note: We're replacing any existing constraint that might limit interval values
ALTER TABLE public.subscription_prices 
DROP CONSTRAINT IF EXISTS subscription_prices_interval_check;

ALTER TABLE public.subscription_prices 
ADD CONSTRAINT subscription_prices_interval_check 
CHECK (interval IN ('day', 'week', 'month', 'year', 'once'));

-- Update the default interval_count to handle 'once' payments
-- For 'once' payments, interval_count should typically be 1
-- Add a check to ensure logical values
ALTER TABLE public.subscription_prices 
DROP CONSTRAINT IF EXISTS subscription_prices_interval_count_check;

ALTER TABLE public.subscription_prices 
ADD CONSTRAINT subscription_prices_interval_count_check 
CHECK (
  (interval = 'once' AND interval_count = 1) OR 
  (interval != 'once' AND interval_count > 0)
);