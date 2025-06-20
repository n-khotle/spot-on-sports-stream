
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Play, Users, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Game {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  trailer_video_url: string | null;
  live_stream_url: string | null;
  status: string;
  featured: boolean;
  game_date: string | null;
  game_time: string | null;
  tags: string[] | null;
  created_at: string;
}

interface StreamingSettings {
  id: string;
  name: string;
  stream_key: string;
  stream_url: string;
  rtmp_url: string;
  hls_url: string;
  quality_preset: string;
  max_bitrate: number;
  resolution: string;
  framerate: number;
  is_active: boolean;
  auto_record: boolean;
  thumbnail_url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Live = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const { verifying } = usePaymentVerification();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);


  const [checkingAccess, setCheckingAccess] = useState(true);
  const [streamingSettings, setStreamingSettings] = useState<StreamingSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Check if user has access through product allocation or subscription
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || authLoading) {
        setCheckingAccess(false);
        return;
      }

      try {
        // Check if user has subscription access
        if (subscribed) {
          setHasAccess(true);
          setCheckingAccess(false);
          return;
        }

        // Check if user has allocated products (for one-time purchases)
        if (profile && (profile as any).allocated_subscription_products && (profile as any).allocated_subscription_products.length > 0) {
          setHasAccess(true);
          setCheckingAccess(false);
          return;
        }

        // If no access found
        setHasAccess(false);
        setCheckingAccess(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, subscribed, profile, authLoading]);

  useEffect(() => {
    // if (hasAccess) {
      fetchData();
    // }
  }, []);

  const fetchData = async () => {
    try {
      // Fetch games
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .in('status', ['live', 'upcoming'])
        .order('game_date', { ascending: true });

      if (gamesError) throw gamesError;

      // Fetch active streaming settings
      const { data: streamingData, error: streamingError } = await supabase
        .from('streaming_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (streamingError) throw streamingError;

      const live = gamesData?.filter(game => game.status === 'live') || [];
      const upcoming = gamesData?.filter(game => game.status === 'upcoming') || [];
      
      console.log('Debug: Live games:', live.length);
      console.log('Debug: Streaming settings:', streamingData?.length || 0, streamingData);
      console.log('Debug: Should show live stream?', streamingData && streamingData.length > 0 && live.length === 0);
      
      setLiveGames(live);
      setUpcomingGames(upcoming);
      setStreamingSettings(streamingData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const getStreamUrl = (game: Game) => {
    // For live games, prioritize streaming settings
    if (game.status === 'live' && streamingSettings.length > 0) {
      const activeStream = streamingSettings[0]; // Get the first active stream
      // Prioritize HLS for live streaming, fallback to stream_url, then game's video
      return activeStream.hls_url || activeStream.stream_url || game.live_stream_url || game.trailer_video_url;
    }
    // For non-live games, use the game's video URL
    return game.live_stream_url || game.trailer_video_url;
  };

  // Fetch streaming settings
  // useEffect(() => {
  //   const fetchStreamingSettings = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from('streaming_settings')
  //         .select('*')
  //         .eq('is_active', true)
  //         .single();

  //       if (error && error.code !== 'PGRST116') {
  //         console.error('Error fetching streaming settings:', error);
  //         return;
  //       }

  //       setStreamingSettings(data);
  //     } catch (error) {
  //       console.error('Error fetching streaming settings:', error);
  //     }
  //   };

  //   if (hasAccess) {
  //     fetchStreamingSettings();
  //   }
  // }, [hasAccess]);

  const handleGetAccess = () => {
    navigate('/subscription');
  };

  // Show loading state
  if (authLoading || subLoading || checkingAccess || verifying) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">
                {verifying ? "Verifying your payment..." : "Loading live stream..."}
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show access required message
  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Access Required</h1>
              <p className="text-lg text-muted-foreground">
                {!user 
                  ? "Please sign in and purchase access to watch the live stream."
                  : "You need to purchase access or have an active subscription to watch the live stream."
                }
              </p>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Get Live Stream Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">HD Quality</Badge>
                    <Badge variant="outline">24/7 Support</Badge>
                    <Badge variant="outline">Multiple Devices</Badge>
                  </div>
                </div>
                <Button onClick={handleGetAccess} className="w-full" size="lg">
                  {!user ? "Sign In & Get Access" : "Get Access"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show live stream
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Live Matches Section */}
          <section>
            {/* <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold">Live Now</h1>
            </div> */}
            {/* Live Stream Section */}
            {streamingSettings.length > 0 && liveGames.length === 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Live Stream - {streamingSettings[0].name}</span>
                  </CardTitle>
                  {streamingSettings[0].description && (
                    <p className="text-muted-foreground">{streamingSettings[0].description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <VideoPlayer
                    src={streamingSettings[0].hls_url || streamingSettings[0].stream_url}
                    poster={streamingSettings[0].thumbnail_url || undefined}
                    title={`Live Stream - ${streamingSettings[0].name}`}
                    isLive={true}
                    className="rounded-lg"
                  />
                </CardContent>
              </Card>
            )}
            
            {liveGames.length === 0 && streamingSettings.length === 0 ? (
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
                      {getStreamUrl(game) && (
                        <VideoPlayer
                          src={getStreamUrl(game)!}
                          poster={game.featured_image_url || (streamingSettings[0]?.thumbnail_url) || undefined}
                          title={game.title}
                          isLive={isGameLive(game)}
                          className="rounded-lg"
                        />
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




  // return (
  //   <div className="min-h-screen bg-background">
  //     <Header />
      
  //     <main className="container mx-auto px-4 py-8">
  //       <div className="space-y-6">
  //         {/* Stream Header */}
  //         <div className="flex items-center justify-between">
  //           <div className="space-y-2">
  //             <h1 className="text-3xl font-bold">Live Stream</h1>
  //             <div className="flex items-center gap-4 text-sm text-muted-foreground">
  //               <div className="flex items-center gap-1">
  //                 <Users className="w-4 h-4" />
  //                 <span>1,234 viewers</span>
  //               </div>
  //               <div className="flex items-center gap-1">
  //                 <Calendar className="w-4 h-4" />
  //                 <span>Live Now</span>
  //               </div>
  //             </div>
  //           </div>
  //           <Badge variant="destructive" className="bg-red-600">
  //             <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
  //             LIVE
  //           </Badge>
  //         </div>

  //         {/* Video Player */}
  //         <div className="space-y-4">
  //           {streamingSettings ? (
  //             <VideoPlayer
  //               src={streamingSettings.hls_url || streamingSettings.stream_url}
  //               poster={streamingSettings.thumbnail_url}
  //               isLive={true}
  //               className="w-full aspect-video bg-black rounded-lg"
  //             />
  //           ) : (
  //             <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
  //               <div className="text-center space-y-4">
  //                 <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
  //                   <Play className="w-8 h-8 text-primary" />
  //                 </div>
  //                 <div>
  //                   <h3 className="text-lg font-semibold">Stream Preparing</h3>
  //                   <p className="text-sm text-muted-foreground">
  //                     The live stream will begin shortly. Please wait...
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           )}
  //         </div>

  //         {/* Stream Info */}
  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Stream Information</CardTitle>
  //           </CardHeader>
  //           <CardContent className="space-y-4">
  //             <div className="grid md:grid-cols-2 gap-4">
  //               <div>
  //                 <h4 className="font-semibold">Your Access Level</h4>
  //                 <p className="text-sm text-muted-foreground">
  //                   {subscribed ? "Subscription Access" : "One-time Purchase Access"}
  //                 </p>
  //               </div>
  //               <div>
  //                 <h4 className="font-semibold">Stream Quality</h4>
  //                 <p className="text-sm text-muted-foreground">
  //                   {streamingSettings?.resolution || "HD 1080p"}
  //                 </p>
  //               </div>
  //             </div>
              
  //             {streamingSettings?.description && (
  //               <div>
  //                 <h4 className="font-semibold">About This Stream</h4>
  //                 <p className="text-sm text-muted-foreground">
  //                   {streamingSettings.description}
  //                 </p>
  //               </div>
  //             )}
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </main>

  //     <Footer />
  //   </div>
  // );
};

export default Live;
