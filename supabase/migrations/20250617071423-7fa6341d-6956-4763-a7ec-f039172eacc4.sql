-- Create storage bucket for game images
INSERT INTO storage.buckets (id, name, public) VALUES ('game-images', 'game-images', true);

-- Create policies for game images bucket
CREATE POLICY "Game images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'game-images');

CREATE POLICY "Authenticated users can upload game images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'game-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update game images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'game-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete game images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'game-images' AND auth.role() = 'authenticated');