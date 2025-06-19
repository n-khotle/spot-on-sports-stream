-- Create storage bucket for subscription product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('subscription-images', 'subscription-images', true);

-- Create policies for subscription image uploads
CREATE POLICY "Anyone can view subscription images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'subscription-images');

CREATE POLICY "Admins can upload subscription images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'subscription-images' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update subscription images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'subscription-images' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete subscription images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'subscription-images' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));