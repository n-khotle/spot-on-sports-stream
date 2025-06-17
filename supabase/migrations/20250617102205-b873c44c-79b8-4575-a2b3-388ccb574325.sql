-- Create streaming_settings table for live stream configurations
CREATE TABLE public.streaming_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stream_key TEXT,
  stream_url TEXT,
  rtmp_url TEXT,
  hls_url TEXT,
  quality_preset TEXT DEFAULT 'medium',
  max_bitrate INTEGER DEFAULT 5000,
  resolution TEXT DEFAULT '1920x1080',
  framerate INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT false,
  auto_record BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.streaming_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for streaming settings (admin only)
CREATE POLICY "Allow admin access to streaming settings" ON public.streaming_settings
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_streaming_settings_updated_at
  BEFORE UPDATE ON public.streaming_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();