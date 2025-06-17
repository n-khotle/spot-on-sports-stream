import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Play } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  trailer_video_url: string | null;
  status: string;
  featured: boolean;
  game_date: string | null;
  game_time: string | null;
  tags: string[] | null;
  created_at: string;
}

const Live = () => {
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .in('status', ['live', 'upcoming'])
        .order('game_date', { ascending: true });

      if (error) throw error;

      const live = data?.filter(game => game.status === 'live') || [];
      const upcoming = data?.filter(game => game.status === 'upcoming') || [];
      
      setLiveGames(live);
      setUpcomingGames(upcoming);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isGameLive = (game: Game) => {
    if (game.status === 'live') return true;
    
    if (game.game_date && game.game_time) {
      const gameDateTime = new Date(`${game.game_date}T${game.game_time}`);
      const now = new Date();
      const timeDiff = gameDateTime.getTime() - now.getTime();
      return timeDiff <= 0 && timeDiff > -3 * 60 * 60 * 1000; // Live if within 3 hours past start time
    }
    
    return false;
  };

  const formatGameTime = (game: Game) => {
    if (!game.game_date || !game.game_time) return null;
    
    const gameDateTime = new Date(`${game.game_date}T${game.game_time}`);
    return gameDateTime.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Live Matches Section */}
          <section>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold">Live Now</h1>
            </div>
            
            {liveGames.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Play className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
                  <p className="text-muted-foreground text-center">
                    There are currently no live matches. Check back later or view upcoming matches below.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveGames.map((game) => (
                  <Card key={game.id} className="group hover:shadow-lg transition-shadow border-red-200 dark:border-red-800">
                    <CardHeader className="relative">
                      {game.featured_image_url && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={game.featured_image_url}
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge variant="destructive" className="animate-pulse">
                          LIVE
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="mb-2">{game.title}</CardTitle>
                      {game.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {game.description}
                        </p>
                      )}
                      {game.tags && game.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {game.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {game.trailer_video_url && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <video
                            src={game.trailer_video_url}
                            controls
                            className="w-full h-full"
                            poster={game.featured_image_url || undefined}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Matches Section */}
          {upcomingGames.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Coming Up</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingGames.map((game) => (
                  <Card key={game.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="relative">
                      {game.featured_image_url && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={game.featured_image_url}
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge variant="outline">
                          UPCOMING
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="mb-2">{game.title}</CardTitle>
                      {game.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {game.description}
                        </p>
                      )}
                      {formatGameTime(game) && (
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatGameTime(game)}
                        </div>
                      )}
                      {game.tags && game.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {game.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Live;