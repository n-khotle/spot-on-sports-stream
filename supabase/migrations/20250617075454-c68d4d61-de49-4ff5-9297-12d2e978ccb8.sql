-- Add date and time fields to games table
ALTER TABLE public.games 
ADD COLUMN game_date DATE,
ADD COLUMN game_time TIME;