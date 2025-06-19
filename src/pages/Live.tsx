
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

const Live = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const { verifying } = usePaymentVerification();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [streamingSettings, setStreamingSettings] = useState<any>(null);

  // Check if user has access through product allocation or subscription
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || authLoading) {
        setHasAccess(false);
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
        if (profile?.allocated_subscription_products && profile.allocated_subscription_products.length > 0) {
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

  // Only fetch streaming settings if user has access
  useEffect(() => {
    const fetchStreamingSettings = async () => {
      // Don't fetch streaming settings if user doesn't have access
      if (!hasAccess) {
        setStreamingSettings(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('streaming_settings')
          .select('*')
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching streaming settings:', error);
          return;
        }

        setStreamingSettings(data);
      } catch (error) {
        console.error('Error fetching streaming settings:', error);
      }
    };

    // Only fetch if we're not checking access and we know the access status
    if (!checkingAccess) {
      fetchStreamingSettings();
    }
  }, [hasAccess, checkingAccess]);

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

  // Show access required message for users without login or payment
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

  // Only show live stream content if user has verified access
  if (hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Stream Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Live Stream</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>1,234 viewers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Live Now</span>
                  </div>
                </div>
              </div>
              <Badge variant="destructive" className="bg-red-600">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE
              </Badge>
            </div>
  
            {/* Video Player - Only show if user has access and streaming settings exist */}
            <div className="space-y-4">
              {streamingSettings ? (
                <VideoPlayer
                  src={streamingSettings.hls_url || streamingSettings.stream_url}
                  poster={streamingSettings.thumbnail_url}
                  autoPlay={true}
                  controls={true}
                  isLive={true}
                  hasAccess={hasAccess}
                  className="w-full aspect-video bg-black rounded-lg"
                />
              ) : (
                <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Stream Preparing</h3>
                      <p className="text-sm text-muted-foreground">
                        The live stream will begin shortly. Please wait...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
  
            {/* Stream Info */}
            <Card>
              <CardHeader>
                <CardTitle>Stream Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Your Access Level</h4>
                    <p className="text-sm text-muted-foreground">
                      {subscribed ? "Subscription Access" : "One-time Purchase Access"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Stream Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      {streamingSettings?.resolution || "HD 1080p"}
                    </p>
                  </div>
                </div>
                
                {streamingSettings?.description && (
                  <div>
                    <h4 className="font-semibold">About This Stream</h4>
                    <p className="text-sm text-muted-foreground">
                      {streamingSettings.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
  
        <Footer />
      </div>
    );
  }

  // Fallback - should not reach here
  return null;
};

export default Live;
