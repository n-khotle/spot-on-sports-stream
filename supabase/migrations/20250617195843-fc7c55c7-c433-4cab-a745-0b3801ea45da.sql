-- Create subscription products table
CREATE TABLE public.subscription_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stripe_product_id TEXT UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription prices table
CREATE TABLE public.subscription_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.subscription_products(id) ON DELETE CASCADE,
  stripe_price_id TEXT UNIQUE,
  currency TEXT NOT NULL DEFAULT 'usd',
  unit_amount INTEGER NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year', 'week', 'day')),
  interval_count INTEGER NOT NULL DEFAULT 1,
  nickname TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage subscription products" 
ON public.subscription_products 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admin can manage subscription prices" 
ON public.subscription_prices 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create function to update timestamps
CREATE TRIGGER update_subscription_products_updated_at
BEFORE UPDATE ON public.subscription_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_prices_updated_at
BEFORE UPDATE ON public.subscription_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();