import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, CreditCard } from 'lucide-react';
import GameForm from '@/components/admin/GameForm';
import GamesTable from '@/components/admin/GamesTable';
import NewsTable from '@/components/admin/NewsTable';

interface Game {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  trailer_video_url: string | null;
  status: string;
  featured: boolean;
  game_date?: string | null;
  game_time?: string | null;
  tags?: string[] | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Redirect if not admin
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (isAdmin) {
      fetchGames();
    }
  }, [isAdmin]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch games",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
  };

  const handleGameSaved = () => {
    setEditingGame(null);
    fetchGames();
  };

  const handleCancel = () => {
    setEditingGame(null);
  };

  if (loading || isLoading) {
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
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="games">Games Management</TabsTrigger>
            <TabsTrigger value="news">News Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="games" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GameForm 
                editingGame={editingGame} 
                onGameSaved={handleGameSaved}
                onCancel={handleCancel}
              />
              <GamesTable 
                games={games} 
                onEditGame={handleEditGame}
                onGamesUpdated={fetchGames}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="news" className="space-y-8">
            <NewsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;