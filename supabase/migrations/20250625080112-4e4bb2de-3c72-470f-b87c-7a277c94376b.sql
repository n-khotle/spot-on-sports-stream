
-- Create analytics table to store user viewing statistics
CREATE TABLE public.analytics_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ip_address INET NOT NULL,
  view_date DATE NOT NULL,
  viewing_duration INTEGER NOT NULL, -- duration in seconds
  bandwidth INTEGER NOT NULL, -- bandwidth in kbps
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_analytics_view_date ON public.analytics_data(view_date);
CREATE INDEX idx_analytics_ip_address ON public.analytics_data(user_ip_address);

-- Create a table to store daily compiled statistics
CREATE TABLE public.daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_date DATE NOT NULL UNIQUE,
  total_views INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_viewing_duration INTEGER DEFAULT 0, -- total seconds
  average_viewing_duration INTEGER DEFAULT 0, -- average seconds
  average_bandwidth INTEGER DEFAULT 0, -- average kbps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to compile daily statistics
CREATE OR REPLACE FUNCTION compile_daily_analytics(target_date DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.daily_analytics (
    analytics_date,
    total_views,
    unique_users,
    total_viewing_duration,
    average_viewing_duration,
    average_bandwidth
  )
  SELECT 
    target_date,
    COUNT(*) as total_views,
    COUNT(DISTINCT user_ip_address) as unique_users,
    SUM(viewing_duration) as total_viewing_duration,
    AVG(viewing_duration)::INTEGER as average_viewing_duration,
    AVG(bandwidth)::INTEGER as average_bandwidth
  FROM public.analytics_data
  WHERE view_date = target_date
  ON CONFLICT (analytics_date) 
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_users = EXCLUDED.unique_users,
    total_viewing_duration = EXCLUDED.total_viewing_duration,
    average_viewing_duration = EXCLUDED.average_viewing_duration,
    average_bandwidth = EXCLUDED.average_bandwidth,
    updated_at = now();
END;
$$;

-- Create trigger to automatically update daily analytics when new data is inserted
CREATE OR REPLACE FUNCTION trigger_compile_daily_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM compile_daily_analytics(NEW.view_date);
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_compile_daily_analytics
  AFTER INSERT ON public.analytics_data
  FOR EACH ROW
  EXECUTE FUNCTION trigger_compile_daily_analytics();

-- Add RLS policies for admin access
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Allow admins to view and manage analytics data
CREATE POLICY "Admins can manage analytics data" 
  ON public.analytics_data 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage daily analytics" 
  ON public.daily_analytics 
  FOR ALL 
  USING (get_current_user_role() = 'admin');
