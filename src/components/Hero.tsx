import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import PaymentModal from "./PaymentModal";

interface FeaturedGame {
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

interface HeroProps {
  featuredGame: FeaturedGame | null;
}

const Hero = ({ featuredGame }: HeroProps) => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  // Function to check if a game is currently live
  const isGameLive = (game: FeaturedGame | null) => {
    if (!game?.game_date || !game?.game_time) return false;
    
    const now = new Date();
    const gameDateTime = new Date(`${game.game_date}T${game.game_time}`);
    const gameEndTime = new Date(gameDateTime.getTime() + 3 * 60 * 60 * 1000); // Assume 3 hours duration
    
    return now >= gameDateTime && now <= gameEndTime;
  };

  const getLiveStatus = () => {
    if (!featuredGame) {
      return {
        text: "COMING SOON",
        variant: "secondary" as const,
        className: "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground border-0 px-4 py-2 text-sm font-semibold"
      };
    }

    if (isGameLive(featuredGame)) {
      return {
        text: "LIVE NOW",
        variant: "destructive" as const,
        className: "bg-gradient-to-r from-red-600 to-red-500 text-white border-0 px-4 py-2 text-sm font-semibold"
      };
    }

    return {
      text: "COMING UP",
      variant: "outline" as const,
      className: "border-primary/30 text-primary bg-primary/10 px-4 py-2 text-sm font-semibold"
    };
  };

  const handleWatchClick = () => {
    // If user is logged in and has active subscription, go to Live page
    if (user && subscribed) {
      navigate('/live');
      return;
    }

    // Otherwise, show payment modal
    setPaymentModalOpen(true);
  };

  const liveStatus = getLiveStatus();
  return (
    <section className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center overflow-hidden">
      {/* Hero Background Image */}
      {featuredGame?.featured_image_url && (
        <div className="absolute inset-0 z-0">
          <img 
            src={featuredGame.featured_image_url} 
            alt={featuredGame.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/95"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50"></div>
        </div>
      )}
      
      {/* Fallback Background for games without featured image */}
      {!featuredGame?.featured_image_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Live Status */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <Badge variant={liveStatus.variant} className={`${liveStatus.className} text-xs sm:text-sm`}>
                {isGameLive(featuredGame) && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                )}
                {liveStatus.text}
              </Badge>
              
              {/* Display tags for Coming Up games */}
              {!isGameLive(featuredGame) && featuredGame?.tags && featuredGame.tags.length > 0 && (
                <>
                  {featuredGame.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-primary/30 text-primary bg-primary/10 px-2 py-1 sm:px-3 text-xs sm:text-sm">
                      {tag}
                    </Badge>
                  ))}
                </>
              )}
              
              {/* Default badges when live or no tags */}
              {(isGameLive(featuredGame) || !featuredGame?.tags?.length) && (
                <>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-2 py-1 sm:px-3 text-xs sm:text-sm">
                    Premier League
                  </Badge>
                  <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground px-2 py-1 sm:px-3 text-xs sm:text-sm">
                    HD Quality
                  </Badge>
                </>
              )}
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6">
              {featuredGame ? (
                <>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-none tracking-tight">
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {featuredGame.title}
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                    {featuredGame.description || "Experience the thrill of live sports with crystal clear 4K streaming."}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-none tracking-tight">
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      No Featured Game
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                    Check back later for featured content or browse our game library.
                  </p>
                </>
              )}
            </div>
            
            {/* Match Details */}
            {featuredGame && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm sm:text-lg">
                {featuredGame.game_date && (
                  <div className="flex items-center space-x-2 bg-secondary/50 rounded-full px-3 py-2 sm:px-4">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold">
                      {format(new Date(featuredGame.game_date), "EEEE, MMMM d")}
                    </span>
                  </div>
                )}
                {featuredGame.game_time && (
                  <div className="flex items-center space-x-2 bg-secondary/50 rounded-full px-3 py-2 sm:px-4">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold">
                      {format(new Date(`2000-01-01T${featuredGame.game_time}`), "h:mm a")}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              {featuredGame ? (
                <>
                  <Button 
                    size="lg" 
                    className="text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group min-h-[44px]"
                    onClick={handleWatchClick}
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 fill-current group-hover:scale-110 transition-transform" />
                    Watch Live
                  </Button>
                  <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 min-h-[44px]" asChild>
                    <Link to="/about-us">Learn More</Link>
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 min-h-[44px]">
                  View All Games
                </Button>
              )}
            </div>

          </div>
          
          {/* Video Player */}
          <div className="relative mt-8 lg:mt-0 lg:scale-110 animate-fade-in delay-300">
            {featuredGame?.trailer_video_url ? (
              <div className="aspect-video bg-secondary/50 rounded-xl sm:rounded-2xl overflow-hidden relative group border border-border/50 shadow-2xl">
                <video 
                  src={featuredGame.trailer_video_url}
                  poster={featuredGame.featured_image_url || undefined}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 rounded-xl sm:rounded-2xl overflow-hidden relative group cursor-pointer border border-border/50 shadow-2xl">
                {/* Featured Game Image or Background Pattern */}
                {featuredGame?.featured_image_url ? (
                  <img 
                    src={featuredGame.featured_image_url} 
                    alt={featuredGame.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                )}
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-foreground fill-current ml-1" />
                    </div>
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Floating Elements - Hidden on mobile for cleaner look */}
            <div className="hidden sm:block absolute -top-4 -right-4 bg-primary/10 backdrop-blur-sm rounded-full p-3 border border-primary/20">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block absolute -bottom-4 -left-4 bg-accent/10 backdrop-blur-sm rounded-full p-4 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
            </div>
          </div>
        </div>

        <PaymentModal 
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          gameTitle={featuredGame?.title}
          gameId={featuredGame?.id}
        />
      </div>
    </section>
  );
};

export default Hero;