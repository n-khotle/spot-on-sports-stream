-- Add subscription product allocation field to profiles table
-- This will track which subscription products are allocated to each user

ALTER TABLE public.profiles 
ADD COLUMN allocated_subscription_products UUID[] DEFAULT '{}';

-- Add an index for better performance when querying allocated products
CREATE INDEX idx_profiles_allocated_subscription_products 
ON public.profiles USING GIN(allocated_subscription_products);

-- Add a comment to explain the field
COMMENT ON COLUMN public.profiles.allocated_subscription_products 
IS 'Array of subscription product IDs that are allocated to this user';

-- Create a function to check if a user has access to a specific product
CREATE OR REPLACE FUNCTION public.user_has_product_access(user_id uuid, product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT product_id = ANY(allocated_subscription_products)
  FROM public.profiles 
  WHERE profiles.user_id = $1;
$$;

-- Create a function to allocate a product to a user
CREATE OR REPLACE FUNCTION public.allocate_product_to_user(target_user_id uuid, product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET allocated_subscription_products = array_append(allocated_subscription_products, product_id)
  WHERE user_id = target_user_id 
  AND NOT (product_id = ANY(allocated_subscription_products));
END;
$$;

-- Create a function to remove a product allocation from a user
CREATE OR REPLACE FUNCTION public.remove_product_from_user(target_user_id uuid, product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET allocated_subscription_products = array_remove(allocated_subscription_products, product_id)
  WHERE user_id = target_user_id;
END;
$$;