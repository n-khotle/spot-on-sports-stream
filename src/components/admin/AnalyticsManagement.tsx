
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsImport from './AnalyticsImport';
import AnalyticsTable from './AnalyticsTable';

const AnalyticsManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataImported = () => {
    // Trigger refresh of analytics table
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Management</CardTitle>
          <CardDescription>
            Import viewing data from spreadsheets and view compiled daily statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import" className="space-y-6">
            <TabsList>
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="analytics">View Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="import">
              <AnalyticsImport onDataImported={handleDataImported} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsTable refreshKey={refreshKey} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsManagement;
