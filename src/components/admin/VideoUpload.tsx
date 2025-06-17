import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface VideoUploadProps {
  videoUrl: string;
  onVideoChange: (url: string) => void;
  disabled?: boolean;
}

const VideoUpload = ({ videoUrl, onVideoChange, disabled }: VideoUploadProps) => {
  const { toast } = useToast();
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const handleVideoUpload = async (file: File) => {
    if (!file) return null;

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('game-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('game-videos')
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
      onVideoChange(uploadedUrl);
    }
  };

  const removeSelectedVideo = () => {
    setSelectedVideoFile(null);
    onVideoChange('');
  };

  return (
    <div className="space-y-2">
      <Label>Trailer Video</Label>
      
      {/* Video Preview */}
      {videoUrl && (
        <div className="relative border border-border rounded-lg overflow-hidden">
          <video 
            src={videoUrl} 
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
            disabled={disabled}
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
            disabled={uploadingVideo || disabled}
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
          value={videoUrl}
          onChange={(e) => onVideoChange(e.target.value)}
          placeholder="https://example.com/video.mp4"
          disabled={uploadingVideo || disabled}
        />
      </div>
    </div>
  );
};

export default VideoUpload;