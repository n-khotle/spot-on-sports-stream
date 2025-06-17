import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Clock } from "lucide-react";

interface FeaturedGame {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  status: string;
  featured: boolean;
  created_at: string;
}

interface HeroProps {
  featuredGame: FeaturedGame | null;
}

const Hero = ({ featuredGame }: HeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            {/* Live Status */}
            <div className="flex items-center space-x-3">
              <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500 text-white border-0 px-4 py-2 text-sm font-semibold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE NOW
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1">
                Premier League
              </Badge>
              <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground px-3 py-1">
                HD Quality
              </Badge>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              {featuredGame ? (
                <>
                  <h1 className="text-5xl lg:text-7xl font-black leading-none tracking-tight">
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {featuredGame.title}
                    </span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                    {featuredGame.description || "Experience the thrill of live sports with crystal clear 4K streaming."}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-5xl lg:text-7xl font-black leading-none tracking-tight">
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      No Featured Game
                    </span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                    Check back later for featured content or browse our game library.
                  </p>
                </>
              )}
            </div>
            
            {/* Match Details */}
            <div className="flex items-center space-x-6 text-lg">
              <div className="flex items-center space-x-2 bg-secondary/50 rounded-full px-4 py-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold">Today</span>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/50 rounded-full px-4 py-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold">3:00 PM EST</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {featuredGame ? (
                <>
                  <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <Play className="w-6 h-6 mr-3 fill-current group-hover:scale-110 transition-transform" />
                    Watch Live - $9.99
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                    Learn More
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                  View All Games
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">45K+</div>
                <div className="text-muted-foreground">Live Viewers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4K</div>
                <div className="text-muted-foreground">Ultra HD</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0ms</div>
                <div className="text-muted-foreground">Delay</div>
              </div>
            </div>
          </div>
          
          {/* Video Preview */}
          <div className="relative lg:scale-110 animate-fade-in delay-300">
            <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl overflow-hidden relative group cursor-pointer border border-border/50 shadow-2xl">
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
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Play className="w-10 h-10 text-primary-foreground fill-current ml-1" />
                  </div>
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse"></div>
                </div>
              </div>
              
              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/95 to-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {featuredGame ? featuredGame.title : "Game Preview"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {featuredGame ? "Featured game content" : "Browse our game library"}
                    </p>
                  </div>
                  {featuredGame && (
                    <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500 animate-pulse">
                      FEATURED
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-primary/10 backdrop-blur-sm rounded-full p-3 border border-primary/20">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-accent/10 backdrop-blur-sm rounded-full p-4 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;