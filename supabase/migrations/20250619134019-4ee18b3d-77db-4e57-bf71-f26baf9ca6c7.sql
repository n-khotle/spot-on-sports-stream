-- Add image_url column to subscription_products table
ALTER TABLE public.subscription_products 
ADD COLUMN image_url TEXT;