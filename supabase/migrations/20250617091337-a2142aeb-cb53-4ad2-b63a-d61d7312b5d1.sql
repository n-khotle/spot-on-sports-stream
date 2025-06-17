-- Add live stream URL field to games table
ALTER TABLE public.games 
ADD COLUMN live_stream_url TEXT;