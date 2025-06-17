import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Play } from "lucide-react";
import { format } from "date-fns";

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
  created_at: string;
}

const Schedule = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledGames();
  }, []);

  const fetchScheduledGames = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .order('game_date', { ascending: true });
    
    setGames(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-lg">Loading schedule...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Game Schedule
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't miss any of the action. View our complete schedule of upcoming games and live streams.
          </p>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No scheduled games available at the moment.</p>
            <p className="text-muted-foreground text-sm">Check back later for exciting matchups!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Card key={game.id} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {game.title}
                    </CardTitle>
                    {game.featured && (
                      <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500">
                        FEATURED
                      </Badge>
                    )}
                  </div>
                  {game.description && (
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                      {game.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Game Image */}
                  {game.featured_image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                      <img 
                        src={game.featured_image_url} 
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="flex flex-col space-y-2">
                    {game.game_date && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold">
                          {format(new Date(game.game_date), "EEEE, MMMM d")}
                        </span>
                      </div>
                    )}
                    {game.game_time && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-semibold">
                          {format(new Date(`2000-01-01T${game.game_time}`), "h:mm a")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    <Play className="w-4 h-4 mr-2" />
                    {game.featured ? "Watch Live - $9.99" : "Watch - $9.99"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Schedule;