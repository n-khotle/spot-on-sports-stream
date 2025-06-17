import { useState } from 'react';
import StreamingForm from '@/components/admin/StreamingForm';
import StreamingTable from '@/components/admin/StreamingTable';
import type { StreamingSettings } from '@/types/admin';

const StreamingManagement = () => {
  const [editingStream, setEditingStream] = useState<StreamingSettings | null>(null);

  const handleEditStream = (stream: StreamingSettings) => {
    console.log('StreamingManagement: Setting editing stream:', stream);
    setEditingStream(stream);
  };

  const handleStreamSaved = () => {
    setEditingStream(null);
  };

  const handleStreamCancel = () => {
    setEditingStream(null);
  };

  const handleStreamsUpdated = () => {
    // This can be used for any additional logic when streams are updated
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <StreamingForm 
        editingStream={editingStream} 
        onStreamSaved={handleStreamSaved}
        onCancel={handleStreamCancel}
      />
      <StreamingTable 
        onEditStream={handleEditStream}
        onStreamsUpdated={handleStreamsUpdated}
      />
    </div>
  );
};

export default StreamingManagement;