-- Add 'once' as a valid interval option for subscription prices
ALTER TABLE public.subscription_prices 
DROP CONSTRAINT IF EXISTS subscription_prices_interval_check;

ALTER TABLE public.subscription_prices 
ADD CONSTRAINT subscription_prices_interval_check 
CHECK (interval IN ('month', 'year', 'week', 'day', 'once'));