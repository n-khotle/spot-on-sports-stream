import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Video } from "lucide-react";

interface NewsVideoUploadProps {
  onVideoUploaded: (url: string) => void;
  currentVideoUrl?: string | null;
  onVideoRemoved?: () => void;
}

const NewsVideoUpload = ({ onVideoUploaded, currentVideoUrl, onVideoRemoved }: NewsVideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `news-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-videos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('news-videos')
        .getPublicUrl(filePath);

      onVideoUploaded(publicUrl);
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Error",
          description: "Please select a video file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Video must be less than 50MB",
          variant: "destructive",
        });
        return;
      }

      uploadVideo(file);
    }
  };

  const removeVideo = () => {
    if (onVideoRemoved) {
      onVideoRemoved();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Video Content</label>
      
      {currentVideoUrl ? (
        <div className="relative">
          <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border border-border">
            <video 
              src={currentVideoUrl} 
              controls
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeVideo}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-md">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Video className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> video content
              </p>
              <p className="text-xs text-muted-foreground">MP4, WebM up to 50MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Upload className="w-4 h-4 animate-spin" />
          <span>Uploading video...</span>
        </div>
      )}
    </div>
  );
};

export default NewsVideoUpload;