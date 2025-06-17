import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
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
    status: editingGame?.status || 'draft',
    featured: editingGame?.featured || false
  });

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
    setFormData({ title: '', description: '', featured_image_url: '', status: 'draft', featured: false });
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
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Game title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Game description"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="featured_image_url">Featured Image URL</Label>
          <Input
            id="featured_image_url"
            value={formData.featured_image_url}
            onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
          />
          <Label htmlFor="featured">Featured Game</Label>
        </div>
        
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