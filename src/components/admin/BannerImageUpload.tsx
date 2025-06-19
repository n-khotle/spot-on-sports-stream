import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BannerImageUploadProps {
  onImageUrlChange: (url: string) => void;
  currentImageUrl?: string;
}

const BannerImageUpload = ({ onImageUrlChange, currentImageUrl }: BannerImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [isValidUrl, setIsValidUrl] = useState(!!currentImageUrl);
  const { toast } = useToast();

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    
    if (!url) {
      setIsValidUrl(false);
      onImageUrlChange("");
      return;
    }

    // Simple URL validation
    try {
      new URL(url);
      setIsValidUrl(true);
      onImageUrlChange(url);
    } catch {
      setIsValidUrl(false);
    }
  };

  const handleImageError = () => {
    setIsValidUrl(false);
    toast({
      title: "Invalid Image URL",
      description: "Please provide a valid image URL",
      variant: "destructive",
    });
  };

  const clearImage = () => {
    setImageUrl("");
    setIsValidUrl(false);
    onImageUrlChange("");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="imageUrl">Banner Image URL</Label>
        <div className="flex space-x-2 mt-2">
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/banner-image.jpg"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          {imageUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Recommended size: 1200x300px or similar banner dimensions
        </p>
      </div>

      {imageUrl && isValidUrl && (
        <div className="border border-border rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Banner preview"
            className="w-full h-32 object-cover"
            onError={handleImageError}
            onLoad={() => setIsValidUrl(true)}
          />
        </div>
      )}
    </div>
  );
};

export default BannerImageUpload;