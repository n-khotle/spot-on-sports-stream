import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-background to-secondary min-h-[60vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="bg-red-600 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE NOW
              </Badge>
              <Badge variant="outline">Premier League</Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Manchester United
              <span className="text-muted-foreground"> vs </span>
              Liverpool FC
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Experience the thrill of live sports with crystal clear streaming. 
              Watch every goal, every save, every moment that matters.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>3:00 PM EST</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Watch Live - $9.99
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                View Schedule
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-video bg-secondary rounded-xl overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Match Preview</span>
                  <Badge variant="destructive">LIVE</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;