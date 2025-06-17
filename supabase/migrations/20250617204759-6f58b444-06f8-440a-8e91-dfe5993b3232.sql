-- Create site settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'My Site',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.site_settings (site_name) VALUES ('Sports Stream');

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can modify, everyone can read
CREATE POLICY "Everyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Create policies for site assets storage
CREATE POLICY "Site assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-assets');

CREATE POLICY "Only admins can upload site assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'site-assets' AND public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update site assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'site-assets' AND public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete site assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'site-assets' AND public.get_current_user_role() = 'admin');