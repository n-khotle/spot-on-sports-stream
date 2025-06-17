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
  game_date?: string | null;
  game_time?: string | null;
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
    featured: editingGame?.featured || false,
    game_date: editingGame?.game_date ? new Date(editingGame.game_date) : null,
    game_time: editingGame?.game_time || ''
  });

  const handleFieldChange = (field: string, value: string | boolean | Date | null) => {
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
      // Prepare data for database with proper date formatting
      const dbData = {
        ...formData,
        game_date: formData.game_date ? formData.game_date.toISOString().split('T')[0] : null,
      };

      if (editingGame) {
        // Update existing game
        const { error } = await supabase
          .from('games')
          .update(dbData)
          .eq('id', editingGame.id);

        if (error) throw error;
        toast({ title: "Success", description: "Game updated successfully!" });
      } else {
        // Create new game
        const { error } = await supabase
          .from('games')
          .insert([dbData]);

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
      featured: false,
      game_date: null,
      game_time: ''
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
            featured: formData.featured,
            game_date: formData.game_date,
            game_time: formData.game_time
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