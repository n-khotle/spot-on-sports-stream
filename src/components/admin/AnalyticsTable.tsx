
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Users, Clock, Wifi, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsTableProps {
  refreshKey: number;
}

interface DailyAnalytics {
  id: string;
  analytics_date: string;
  total_views: number;
  unique_users: number;
  total_viewing_duration: number;
  average_viewing_duration: number;
  average_bandwidth: number;
  created_at: string;
  updated_at: string;
}

const AnalyticsTable = ({ refreshKey }: AnalyticsTableProps) => {
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      let query = supabase
        .from('daily_analytics')
        .select('*')
        .order('analytics_date', { ascending: false });

      if (dateFilter) {
        query = query.gte('analytics_date', dateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshKey, dateFilter]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatBandwidth = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} kbps`;
  };

  const totalStats = analytics.reduce(
    (acc, day) => ({
      totalViews: acc.totalViews + day.total_views,
      totalUsers: acc.totalUsers + day.unique_users,
      totalDuration: acc.totalDuration + day.total_viewing_duration,
    }),
    { totalViews: 0, totalUsers: 0, totalDuration: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Views</span>
            </div>
            <p className="text-2xl font-bold">{totalStats.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{totalStats.totalUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Total Duration</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(totalStats.totalDuration)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Days Tracked</span>
            </div>
            <p className="text-2xl font-bold">{analytics.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="date-filter">From Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setDateFilter('')}
            >
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Analytics</CardTitle>
          <CardDescription>
            Compiled viewing statistics by day
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No analytics data available. Import some data to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Unique Users</TableHead>
                  <TableHead>Total Duration</TableHead>
                  <TableHead>Avg Duration</TableHead>
                  <TableHead>Avg Bandwidth</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((day) => (
                  <TableRow key={day.id}>
                    <TableCell className="font-medium">
                      {new Date(day.analytics_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {day.total_views.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {day.unique_users.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(day.total_viewing_duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDuration(day.average_viewing_duration)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        {formatBandwidth(day.average_bandwidth)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(day.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTable;
