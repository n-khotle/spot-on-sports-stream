import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image } from "lucide-react";

interface NewsImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string | null;
  onImageRemoved?: () => void;
}

const NewsImageUpload = ({ onImageUploaded, currentImageUrl, onImageRemoved }: NewsImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
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
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      uploadImage(file);
    }
  };

  const removeImage = () => {
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Featured Image</label>
      
      {currentImageUrl ? (
        <div className="relative">
          <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border border-border">
            <img 
              src={currentImageUrl} 
              alt="Featured image" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-md">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Image className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> featured image
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Upload className="w-4 h-4 animate-spin" />
          <span>Uploading image...</span>
        </div>
      )}
    </div>
  );
};

export default NewsImageUpload;