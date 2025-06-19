-- Add policies to allow all authenticated users to view subscription products and prices
-- These should be visible to everyone so users can see available packages

-- Allow all authenticated users to view subscription products
CREATE POLICY "Authenticated users can view subscription products" 
ON public.subscription_products 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view subscription prices
CREATE POLICY "Authenticated users can view subscription prices" 
ON public.subscription_prices 
FOR SELECT 
USING (auth.uid() IS NOT NULL);