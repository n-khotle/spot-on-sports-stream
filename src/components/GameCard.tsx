import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import PaymentModal from "./PaymentModal";

interface GameCardProps {
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  price: string;
  status: "live" | "upcoming" | "ended";
  viewers?: number;
  imageUrl?: string;
}

const GameCard = ({ homeTeam, awayTeam, league, date, time, price, status, viewers, imageUrl }: GameCardProps) => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleBuyNow = () => {
    // If user is logged in and has active subscription, go to Live page
    if (user && subscribed) {
      navigate('/live');
      return;
    }

    // Otherwise, show payment modal
    setPaymentModalOpen(true);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "live":
        return (
          <Badge variant="destructive" className="bg-red-600 text-white">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
            LIVE
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">UPCOMING</Badge>;
      case "ended":
        return <Badge variant="outline">ENDED</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-card border-border">
      <CardContent className="p-0">
        <div className="aspect-video bg-secondary rounded-t-lg relative overflow-hidden">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={`${homeTeam} vs ${awayTeam}`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-start">
            {getStatusBadge()}
            <Badge variant="outline" className="text-xs">{league}</Badge>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold leading-tight">
              {homeTeam} <span className="text-muted-foreground">vs</span> {awayTeam}
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-1">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{date}</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{time}</span>
            </div>
          </div>
          
          {viewers && status === "live" && (
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{viewers.toLocaleString()} watching</span>
            </div>
          )}
          
          <div className="flex flex-col space-y-2 sm:space-y-3">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-primary">P15.00</span>
            </div>
            <Button 
              className="w-full min-h-[44px] text-sm sm:text-base" 
              onClick={handleBuyNow}
              disabled={status === "ended"}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              {status === "live" ? "Watch Live" : status === "upcoming" ? "Watch Live" : "Replay"}
            </Button>
          </div>
        </div>
        
        <PaymentModal 
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          gameTitle={`${homeTeam} vs ${awayTeam}`}
          gameId={homeTeam} // You might want to pass a proper game ID here
        />
      </CardContent>
    </Card>
  );
};

export default GameCard;