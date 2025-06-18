-- Add Google Analytics and Meta Pixel columns to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN google_analytics_id TEXT,
ADD COLUMN meta_pixel_id TEXT;