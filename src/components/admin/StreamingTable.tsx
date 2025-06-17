import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Video, 
  Edit, 
  Trash2, 
  Play, 
  Square, 
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react';

interface StreamingSettings {
  id: string;
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
  created_at: string;
  updated_at: string;
}

interface StreamingTableProps {
  onEditStream: (stream: StreamingSettings) => void;
  onStreamsUpdated: () => void;
}

const StreamingTable = ({ onEditStream, onStreamsUpdated }: StreamingTableProps) => {
  const { toast } = useToast();
  const [streams, setStreams] = useState<StreamingSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('streaming_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStreams(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch streaming settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('streaming_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stream configuration deleted successfully",
      });

      fetchStreams();
      onStreamsUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stream configuration",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (stream: StreamingSettings) => {
    try {
      const { error } = await supabase
        .from('streaming_settings')
        .update({ is_active: !stream.is_active })
        .eq('id', stream.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Stream ${!stream.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      fetchStreams();
      onStreamsUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stream status",
        variant: "destructive",
      });
    }
  };

  const copyStreamKey = (streamKey: string) => {
    navigator.clipboard.writeText(streamKey);
    toast({
      title: "Copied",
      description: "Stream key copied to clipboard",
    });
  };

  const getQualityBadgeColor = (preset: string) => {
    switch (preset) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'default';
      case 'ultra': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span>Stream Configurations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading streams...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5" />
          <span>Stream Configurations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {streams.length === 0 ? (
          <div className="text-center py-8">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stream Configurations</h3>
            <p className="text-muted-foreground">
              Create your first stream configuration to start live streaming.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Bitrate</TableHead>
                  <TableHead>URLs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{stream.name}</div>
                        {stream.description && (
                          <div className="text-sm text-muted-foreground">
                            {stream.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={stream.is_active ? "default" : "secondary"}
                          className={stream.is_active ? "bg-green-600" : ""}
                        >
                          {stream.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {stream.auto_record && (
                          <Badge variant="outline" className="text-xs">
                            Auto Record
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getQualityBadgeColor(stream.quality_preset)}>
                        {stream.quality_preset.charAt(0).toUpperCase() + stream.quality_preset.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{stream.resolution}</TableCell>
                    <TableCell>{stream.max_bitrate} kbps</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {stream.rtmp_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(stream.rtmp_url, '_blank')}
                            title="RTMP URL"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        {stream.hls_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(stream.hls_url, '_blank')}
                            title="HLS URL"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        {stream.stream_key && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyStreamKey(stream.stream_key)}
                            title="Copy Stream Key"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(stream)}
                          title={stream.is_active ? "Deactivate Stream" : "Activate Stream"}
                        >
                          {stream.is_active ? (
                            <Square className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('Edit button clicked for stream:', stream);
                            onEditStream(stream);
                          }}
                          title="Edit Stream"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete Stream"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Stream Configuration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{stream.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(stream.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreamingTable;