-- Add trailer video URL field to games table
ALTER TABLE public.games 
ADD COLUMN trailer_video_url TEXT;