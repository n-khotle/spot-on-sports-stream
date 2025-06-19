-- Drop the existing restrictive policy for streaming_settings
DROP POLICY IF EXISTS "Allow admin access to streaming settings" ON public.streaming_settings;

-- Create separate policies: admins can do everything, authenticated users can view
CREATE POLICY "Admins can manage streaming settings" 
ON public.streaming_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Authenticated users can view streaming settings" 
ON public.streaming_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);