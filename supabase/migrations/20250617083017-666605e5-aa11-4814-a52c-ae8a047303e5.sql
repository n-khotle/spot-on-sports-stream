-- Create news/articles table
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  video_url TEXT,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for news articles
CREATE POLICY "Anyone can view published articles" 
ON public.news_articles 
FOR SELECT 
USING (published = true);

CREATE POLICY "Admins can manage all articles" 
ON public.news_articles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create storage buckets for news content
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('news-videos', 'news-videos', true);

-- Create storage policies for news images
CREATE POLICY "News images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "Admins can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update news images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete news images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create storage policies for news videos
CREATE POLICY "News videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-videos');

CREATE POLICY "Admins can upload news videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'news-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update news videos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'news-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete news videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'news-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();