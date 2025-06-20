import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const navigate = useNavigate();
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
      .eq('featured', false)
      .order('game_date', { ascending: true })
      .order('game_time', { ascending: true });
    
    setGames(data || []);
    setLoading(false);
  };

  const handleWatchClick = (game: Game) => {
    // Check user subscription handled on live page
    navigate('/live');
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
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Game</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id} className="hover:bg-muted/50">
                    <TableCell>
                       <div className="space-y-1">
                         <span className="font-semibold">{game.title}</span>
                         {game.description && (
                           <p className="text-sm text-muted-foreground line-clamp-1">
                             {game.description}
                           </p>
                         )}
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {game.game_date 
                            ? format(new Date(game.game_date), "MMM d, yyyy")
                            : "TBD"
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {game.game_time 
                            ? format(new Date(`2000-01-01T${game.game_time}`), "h:mm a")
                            : "TBD"
                          }
                        </span>
                      </div>
                    </TableCell>
                     <TableCell>
                       <Badge variant="secondary">
                         Upcoming
                       </Badge>
                     </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm"
                        onClick={() => handleWatchClick(game)}
                        className="min-w-[80px]"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Schedule;