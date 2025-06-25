
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsImportProps {
  onDataImported: () => void;
}

interface AnalyticsRow {
  user_ip_address: string;
  view_date: string;
  viewing_duration: number;
  bandwidth: number;
}

const AnalyticsImport = ({ onDataImported }: AnalyticsImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or Excel file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const parseCSV = (csvText: string): AnalyticsRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Map headers to expected field names
    const headerMap: Record<string, string> = {
      'user ip address': 'user_ip_address',
      'ip address': 'user_ip_address',
      'ip': 'user_ip_address',
      'user view date': 'view_date',
      'view date': 'view_date',
      'date': 'view_date',
      'user viewing duration': 'viewing_duration',
      'viewing duration': 'viewing_duration',
      'duration': 'viewing_duration',
      'user bandwidth': 'bandwidth',
      'bandwidth': 'bandwidth'
    };

    const fieldIndices: Record<string, number> = {};
    headers.forEach((header, index) => {
      const mappedField = headerMap[header];
      if (mappedField) {
        fieldIndices[mappedField] = index;
      }
    });

    // Validate required fields
    const requiredFields = ['user_ip_address', 'view_date', 'viewing_duration', 'bandwidth'];
    const missingFields = requiredFields.filter(field => fieldIndices[field] === undefined);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
    }

    const data: AnalyticsRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < headers.length) continue;
      
      try {
        const row: AnalyticsRow = {
          user_ip_address: values[fieldIndices.user_ip_address],
          view_date: values[fieldIndices.view_date],
          viewing_duration: parseInt(values[fieldIndices.viewing_duration]) || 0,
          bandwidth: parseInt(values[fieldIndices.bandwidth]) || 0
        };
        
        // Basic validation
        if (row.user_ip_address && row.view_date) {
          data.push(row);
        }
      } catch (error) {
        console.warn(`Skipping invalid row ${i + 1}:`, error);
      }
    }
    
    return data;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    
    try {
      const text = await file.text();
      const analyticsData = parseCSV(text);
      
      if (analyticsData.length === 0) {
        throw new Error('No valid data found in the file');
      }

      // Insert data in batches
      const batchSize = 100;
      let totalInserted = 0;
      
      for (let i = 0; i < analyticsData.length; i += batchSize) {
        const batch = analyticsData.slice(i, i + batchSize);
        const { error } = await supabase
          .from('analytics_data')
          .insert(batch);
          
        if (error) throw error;
        totalInserted += batch.length;
      }

      setUploadStatus('success');
      setFile(null);
      onDataImported();
      
      toast({
        title: "Import successful",
        description: `Imported ${totalInserted} analytics records`,
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to import analytics data');
      
      toast({
        title: "Import failed",
        description: error.message || 'Failed to import analytics data',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Analytics Data
          </CardTitle>
          <CardDescription>
            Upload a CSV or Excel file with viewing statistics. Required columns: User IP Address, View Date, Viewing Duration (seconds), Bandwidth (kbps)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="analytics-file">Select File</Label>
            <Input
              id="analytics-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>
          
          {file && (
            <Alert>
              <FileSpreadsheet className="w-4 h-4" />
              <AlertDescription>
                Ready to import: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}
          
          {uploadStatus === 'success' && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="text-green-600">
                Analytics data imported successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Importing...' : 'Import Analytics Data'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>File Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Required columns (case-insensitive):</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>User IP Address</strong> - The IP address of the viewer</li>
              <li><strong>View Date</strong> - Date of viewing (YYYY-MM-DD format preferred)</li>
              <li><strong>Viewing Duration</strong> - Duration in seconds</li>
              <li><strong>Bandwidth</strong> - Bandwidth usage in kbps</li>
            </ul>
            <p className="mt-4"><strong>Supported formats:</strong> CSV (.csv), Excel (.xlsx, .xls)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsImport;
