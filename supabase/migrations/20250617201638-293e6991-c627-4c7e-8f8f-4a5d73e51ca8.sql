-- Add missing RLS policies for subscription_prices table
-- Admin can view all subscription prices
CREATE POLICY "Admin can view all subscription prices" 
ON public.subscription_prices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Admin can insert subscription prices
CREATE POLICY "Admin can insert subscription prices" 
ON public.subscription_prices 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Admin can update subscription prices
CREATE POLICY "Admin can update subscription prices" 
ON public.subscription_prices 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Admin can delete subscription prices
CREATE POLICY "Admin can delete subscription prices" 
ON public.subscription_prices 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));