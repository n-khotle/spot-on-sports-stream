-- Add featured field to games table
ALTER TABLE public.games ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for featured games for better performance
CREATE INDEX idx_games_featured ON public.games(featured);

-- Add constraint to ensure only one game can be featured at a time
CREATE UNIQUE INDEX idx_games_featured_unique ON public.games(featured) WHERE featured = true;