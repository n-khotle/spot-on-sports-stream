import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Video, Save, X, Eye, EyeOff } from 'lucide-react';

interface StreamingSettings {
  id?: string;
  name: string;
  stream_key: string;
  stream_url: string;
  rtmp_url: string;
  hls_url: string;
  quality_preset: string;
  max_bitrate: number;
  resolution: string;
  framerate: number;
  is_active: boolean;
  auto_record: boolean;
  thumbnail_url: string;
  description: string;
}

interface StreamingFormProps {
  editingStream?: StreamingSettings | null;
  onStreamSaved: () => void;
  onCancel: () => void;
}

const StreamingForm = ({ editingStream, onStreamSaved, onCancel }: StreamingFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [formData, setFormData] = useState<StreamingSettings>({
    name: '',
    stream_key: '',
    stream_url: '',
    rtmp_url: '',
    hls_url: '',
    quality_preset: 'medium',
    max_bitrate: 5000,
    resolution: '1920x1080',
    framerate: 30,
    is_active: false,
    auto_record: true,
    thumbnail_url: '',
    description: ''
  });

  useEffect(() => {
    console.log('StreamingForm: editingStream changed:', editingStream);
    if (editingStream) {
      console.log('StreamingForm: Setting form data from editing stream');
      setFormData(editingStream);
    } else {
      console.log('StreamingForm: Resetting form for new stream');
      // Reset form for new stream
      setFormData({
        name: '',
        stream_key: '',
        stream_url: '',
        rtmp_url: '',
        hls_url: '',
        quality_preset: 'medium',
        max_bitrate: 5000,
        resolution: '1920x1080',
        framerate: 30,
        is_active: false,
        auto_record: true,
        thumbnail_url: '',
        description: ''
      });
    }
  }, [editingStream]);

  const generateStreamKey = () => {
    const key = Math.random().toString(36).substr(2, 24);
    setFormData({ ...formData, stream_key: key });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const streamData = {
        name: formData.name,
        stream_key: formData.stream_key,
        stream_url: formData.stream_url,
        rtmp_url: formData.rtmp_url,
        hls_url: formData.hls_url,
        quality_preset: formData.quality_preset,
        max_bitrate: formData.max_bitrate,
        resolution: formData.resolution,
        framerate: formData.framerate,
        is_active: formData.is_active,
        auto_record: formData.auto_record,
        thumbnail_url: formData.thumbnail_url,
        description: formData.description
      };

      if (editingStream?.id) {
        const { error } = await supabase
          .from('streaming_settings')
          .update(streamData)
          .eq('id', editingStream.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Streaming settings updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('streaming_settings')
          .insert([streamData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Streaming settings created successfully",
        });
      }

      onStreamSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save streaming settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof StreamingSettings, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5" />
          <span>{editingStream ? 'Edit Stream' : 'Add New Stream'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Stream Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Main Sports Stream"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description of this stream configuration"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active Stream</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_record"
                  checked={formData.auto_record}
                  onCheckedChange={(checked) => handleInputChange('auto_record', checked)}
                />
                <Label htmlFor="auto_record">Auto Record</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stream Configuration</h3>
            
            <div>
              <Label htmlFor="stream_key">Stream Key</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="stream_key"
                    type={showStreamKey ? "text" : "password"}
                    value={formData.stream_key}
                    onChange={(e) => handleInputChange('stream_key', e.target.value)}
                    placeholder="Your stream key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowStreamKey(!showStreamKey)}
                  >
                    {showStreamKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateStreamKey}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="rtmp_url">RTMP URL</Label>
              <Input
                id="rtmp_url"
                value={formData.rtmp_url}
                onChange={(e) => handleInputChange('rtmp_url', e.target.value)}
                placeholder="rtmp://live.example.com/live/"
              />
            </div>

            <div>
              <Label htmlFor="hls_url">HLS URL</Label>
              <Input
                id="hls_url"
                value={formData.hls_url}
                onChange={(e) => handleInputChange('hls_url', e.target.value)}
                placeholder="https://live.example.com/hls/stream.m3u8"
              />
            </div>

            <div>
              <Label htmlFor="stream_url">Stream URL</Label>
              <Input
                id="stream_url"
                value={formData.stream_url}
                onChange={(e) => handleInputChange('stream_url', e.target.value)}
                placeholder="https://live.example.com/stream"
              />
            </div>

            <div>
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quality Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quality_preset">Quality Preset</Label>
                <Select
                  value={formData.quality_preset}
                  onValueChange={(value) => handleInputChange('quality_preset', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (480p)</SelectItem>
                    <SelectItem value="medium">Medium (720p)</SelectItem>
                    <SelectItem value="high">High (1080p)</SelectItem>
                    <SelectItem value="ultra">Ultra (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Select
                  value={formData.resolution}
                  onValueChange={(value) => handleInputChange('resolution', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                    <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                    <SelectItem value="2560x1440">1440p (2560x1440)</SelectItem>
                    <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_bitrate">Max Bitrate (kbps)</Label>
                <Input
                  id="max_bitrate"
                  type="number"
                  value={formData.max_bitrate}
                  onChange={(e) => handleInputChange('max_bitrate', parseInt(e.target.value))}
                  placeholder="5000"
                  min="500"
                  max="50000"
                />
              </div>

              <div>
                <Label htmlFor="framerate">Frame Rate (fps)</Label>
                <Select
                  value={formData.framerate.toString()}
                  onValueChange={(value) => handleInputChange('framerate', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Stream'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StreamingForm;