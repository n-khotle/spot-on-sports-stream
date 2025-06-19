import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Image } from 'lucide-react';

interface SubscriptionImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  disabled?: boolean;
}

const SubscriptionImageUpload = ({ imageUrl, onImageChange, disabled }: SubscriptionImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('subscription-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('subscription-images')
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

    const uploadedUrl = await handleFileUpload(file);
    if (uploadedUrl) {
      onImageChange(uploadedUrl);
    }
  };

  const removeImage = () => {
    onImageChange('');
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center space-x-2">
        <Image className="w-4 h-4" />
        <span>Product Image</span>
      </Label>
      
      {/* Image Preview */}
      {imageUrl && (
        <div className="relative border border-border rounded-lg overflow-hidden bg-card">
          <img 
            src={imageUrl} 
            alt="Subscription product preview"
            className="w-full h-40 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* File Upload */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading || disabled}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Alternative URL Input */}
        <div className="space-y-2">
          <Label htmlFor="image_url" className="text-sm text-muted-foreground">Or enter image URL:</Label>
          <Input
            id="image_url"
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={uploading || disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionImageUpload;