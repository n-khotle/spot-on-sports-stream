-- Create pages table for managing static content
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Pages are viewable by everyone" 
ON public.pages 
FOR SELECT 
USING (true);

-- Create policies for admin write access
CREATE POLICY "Admins can insert pages" 
ON public.pages 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update pages" 
ON public.pages 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete pages" 
ON public.pages 
FOR DELETE 
USING (public.get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pages
INSERT INTO public.pages (slug, title, content) VALUES 
('about-us', 'About Us', 'Welcome to Spot On - your ultimate destination for live sports streaming. We are passionate about bringing you closer to the action with high-quality streams and real-time updates.'),
('privacy-policy', 'Privacy Policy', 'This Privacy Policy describes how we collect, use, and protect your information when you use our sports streaming service.'),
('terms-of-service', 'Terms of Service', 'By using our sports streaming service, you agree to comply with and be bound by the following terms and conditions.');