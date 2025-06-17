import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import GameCard from "./GameCard";

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

const FeaturedGames = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetchPublishedGames();
  }, []);

  const fetchPublishedGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6);
    
    setGames(data || []);
  };

  // Transform database games to GameCard format
  const transformedGames = games.map(game => ({
    homeTeam: game.title.split(' vs ')[0] || game.title,
    awayTeam: game.title.split(' vs ')[1] || "TBD",
    league: "Live Stream",
    date: game.game_date ? new Date(game.game_date).toLocaleDateString() : "TBD",
    time: game.game_time || "TBD",
    price: "$9.99",
    status: game.featured ? "live" as const : "upcoming" as const,
    viewers: game.featured ? 45000 : undefined
  }));

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Games</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't miss these exciting matches. Get instant access to live and upcoming games.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformedGames.map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
        
        {games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No published games available at the moment.</p>
            <p className="text-muted-foreground text-sm mt-2">Check back later for exciting content!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedGames;