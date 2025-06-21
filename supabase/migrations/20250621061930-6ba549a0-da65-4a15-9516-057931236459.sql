-- Add contact information fields to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN contact_email text,
ADD COLUMN contact_phone text,
ADD COLUMN contact_address text,
ADD COLUMN contact_hours text,
ADD COLUMN contact_description text;