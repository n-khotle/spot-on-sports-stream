-- Add tags column to games table
ALTER TABLE public.games 
ADD COLUMN tags TEXT[];

-- Add an index for better performance when filtering by tags
CREATE INDEX idx_games_tags ON public.games USING GIN(tags);