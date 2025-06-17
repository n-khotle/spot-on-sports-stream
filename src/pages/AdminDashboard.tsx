import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, CreditCard } from 'lucide-react';
import GameManagement from '@/components/admin/GameManagement';
import NewsTable from '@/components/admin/NewsTable';
import PageManagement from '@/components/admin/PageManagement';
import StreamingManagement from '@/components/admin/StreamingManagement';
import UserManagement from '@/components/admin/UserManagement';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';

const AdminDashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();

  // Redirect if not admin - moved AFTER all hooks
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => window.location.href = '/admin/payment-settings'} 
              variant="outline" 
              size="sm"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Settings
            </Button>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="games" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl">
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="games" className="space-y-8">
            <GameManagement />
          </TabsContent>
          
          <TabsContent value="news" className="space-y-8">
            <NewsTable />
          </TabsContent>
          
          <TabsContent value="pages" className="space-y-8">
            <PageManagement />
          </TabsContent>

          <TabsContent value="streaming" className="space-y-8">
            <StreamingManagement />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-8">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;