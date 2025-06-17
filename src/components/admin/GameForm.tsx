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
import { Plus, Save, Upload, X, Video } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('game-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const uploadedUrl = await handleFileUpload(file);
    if (uploadedUrl) {
      setFormData({ ...formData, featured_image_url: uploadedUrl });
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return null;

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('game-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Video Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedVideoFile(file);
    const uploadedUrl = await handleVideoUpload(file);
    if (uploadedUrl) {
      setFormData({ ...formData, trailer_video_url: uploadedUrl });
    }
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    setFormData({ ...formData, featured_image_url: '' });
  };

  const removeSelectedVideo = () => {
    setSelectedVideoFile(null);
    setFormData({ ...formData, trailer_video_url: '' });
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
    setFormData({ title: '', description: '', featured_image_url: '', trailer_video_url: '', status: 'draft', featured: false });
    setSelectedFile(null);
    setSelectedVideoFile(null);
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
          <Label>Featured Image</Label>
          
          {/* Image Preview */}
          {formData.featured_image_url && (
            <div className="relative border border-border rounded-lg overflow-hidden">
              <img 
                src={formData.featured_image_url} 
                alt="Featured game preview"
                className="w-full h-32 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeSelectedImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* File Upload */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Alternative URL Input */}
          <div className="space-y-2">
            <Label htmlFor="featured_image_url" className="text-sm text-muted-foreground">Or enter image URL:</Label>
            <Input
              id="featured_image_url"
              value={formData.featured_image_url}
              onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              disabled={uploading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Trailer Video</Label>
          
          {/* Video Preview */}
          {formData.trailer_video_url && (
            <div className="relative border border-border rounded-lg overflow-hidden">
              <video 
                src={formData.trailer_video_url} 
                className="w-full h-32 object-cover"
                controls
                preload="metadata"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeSelectedVideo}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* Video Upload */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                disabled={uploadingVideo}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {uploadingVideo && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Uploading video...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Alternative Video URL Input */}
          <div className="space-y-2">
            <Label htmlFor="trailer_video_url" className="text-sm text-muted-foreground">Or enter video URL:</Label>
            <Input
              id="trailer_video_url"
              value={formData.trailer_video_url}
              onChange={(e) => setFormData({ ...formData, trailer_video_url: e.target.value })}
              placeholder="https://example.com/video.mp4"
              disabled={uploadingVideo}
            />
          </div>
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