-- Update the games policy to allow users to see both published and live games
DROP POLICY IF EXISTS "Anyone can view published games" ON public.games;

CREATE POLICY "Anyone can view published and live games" 
ON public.games 
FOR SELECT 
USING (status IN ('published', 'live', 'upcoming'));