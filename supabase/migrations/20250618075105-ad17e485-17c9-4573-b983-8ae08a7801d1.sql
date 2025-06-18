-- Add social media handle columns to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN instagram_handle TEXT,
ADD COLUMN facebook_handle TEXT,
ADD COLUMN x_handle TEXT,
ADD COLUMN tiktok_handle TEXT;