import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save } from 'lucide-react';
import ImageUpload from './ImageUpload';
import VideoUpload from './VideoUpload';
import GameFormFields from './GameFormFields';

interface Game {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  trailer_video_url: string | null;
  status: string;
  featured: boolean;
  created_at: string;
}

interface GameFormProps {
  editingGame: Game | null;
  onGameSaved: () => void;
  onCancel: () => void;
}

const GameForm = ({ editingGame, onGameSaved, onCancel }: GameFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: editingGame?.title || '',
    description: editingGame?.description || '',
    featured_image_url: editingGame?.featured_image_url || '',
    trailer_video_url: editingGame?.trailer_video_url || '',
    status: editingGame?.status || 'draft',
    featured: editingGame?.featured || false
  });

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (url: string) => {
    setFormData({ ...formData, featured_image_url: url });
  };

  const handleVideoChange = (url: string) => {
    setFormData({ ...formData, trailer_video_url: url });
  };

  const handleSaveGame = async () => {
    try {
      if (editingGame) {
        // Update existing game
        const { error } = await supabase
          .from('games')
          .update(formData)
          .eq('id', editingGame.id);

        if (error) throw error;
        toast({ title: "Success", description: "Game updated successfully!" });
      } else {
        // Create new game
        const { error } = await supabase
          .from('games')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Game created successfully!" });
      }

      resetForm();
      onGameSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      featured_image_url: '', 
      trailer_video_url: '', 
      status: 'draft', 
      featured: false 
    });
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          {editingGame ? 'Edit Game' : 'Add New Game'}
        </CardTitle>
        <CardDescription>
          {editingGame ? 'Update game information' : 'Create a new game entry'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GameFormFields 
          formData={{
            title: formData.title,
            description: formData.description,
            status: formData.status,
            featured: formData.featured
          }}
          onFieldChange={handleFieldChange}
        />
        
        <ImageUpload 
          imageUrl={formData.featured_image_url}
          onImageChange={handleImageChange}
        />
        
        <VideoUpload 
          videoUrl={formData.trailer_video_url}
          onVideoChange={handleVideoChange}
        />
        
        <div className="flex space-x-2">
          <Button onClick={handleSaveGame} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {editingGame ? 'Update' : 'Create'}
          </Button>
          {editingGame && (
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameForm;