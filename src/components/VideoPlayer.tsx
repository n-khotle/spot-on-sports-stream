import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  Download,
  MoreVertical,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  isLive?: boolean;
  className?: string;
}

const VideoPlayer = ({ src, poster, title, isLive = false, className }: VideoPlayerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [quality, setQuality] = useState('Auto');
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  let hideControlsTimeout: NodeJS.Timeout;

  // Detect iOS devices
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  // Check access once when component mounts or when user/subscription changes
  useEffect(() => {
    let isMounted = true;
    
    const checkAccess = async () => {
      console.log('VideoPlayer: Checking access for user:', user?.id);
      
      if (!user) {
        console.log('VideoPlayer: No user, setting hasAccess to false');
        if (isMounted) {
          setHasAccess(false);
          setAccessChecked(true);
        }
        return;
      }
      
      try {
        // User has access if they have a subscription
        if (subscribed) {
          console.log('VideoPlayer: User has subscription access');
          if (isMounted) {
            setHasAccess(true);
            setAccessChecked(true);
          }
          return;
        }

        // Check for allocated products
        const { data, error } = await supabase
          .from('profiles')
          .select('allocated_subscription_products')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('VideoPlayer: Error fetching user profile:', error);
          if (isMounted) {
            setHasAccess(false);
            setAccessChecked(true);
          }
          return;
        }
        
        const hasAllocatedProducts = data?.allocated_subscription_products && data.allocated_subscription_products.length > 0;
        console.log('VideoPlayer: Has allocated products:', hasAllocatedProducts);
        
        if (isMounted) {
          setHasAccess(hasAllocatedProducts);
          setAccessChecked(true);
        }
      } catch (error) {
        console.error('VideoPlayer: Error in access check:', error);
        if (isMounted) {
          setHasAccess(false);
          setAccessChecked(true);
        }
      }
    };

    checkAccess();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, subscribed]); // Only depend on user ID and subscription status

  // Initialize video only after access is confirmed
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !accessChecked || !hasAccess || !src) {
      console.log('VideoPlayer: Skipping video initialization', { 
        hasVideo: !!video, 
        accessChecked, 
        hasAccess, 
        hasSrc: !!src 
      });
      return;
    }

    console.log('VideoPlayer: Initializing video with src:', src);
    setIsLoading(true);

    // Clean up any existing HLS instance
    if (hlsRef.current) {
      console.log('VideoPlayer: Cleaning up existing HLS instance');
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const initializeVideo = () => {
      if (src.includes('.m3u8')) {
        console.log('VideoPlayer: Initializing HLS stream');
        // HLS stream
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: isLive,
            backBufferLength: isLive ? 5 : 30,
          });
          
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('VideoPlayer: HLS manifest loaded successfully');
            setIsLoading(false);
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('VideoPlayer: HLS error:', data);
            if (data.fatal) {
              setIsLoading(false);
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('VideoPlayer: Fatal network error, trying to recover');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('VideoPlayer: Fatal media error, trying to recover');
                  hls.recoverMediaError();
                  break;
                default:
                  console.log('VideoPlayer: Fatal error, cannot recover');
                  hls.destroy();
                  hlsRef.current = null;
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('VideoPlayer: Using native HLS support');
          // Native HLS support (Safari)
          video.src = src;
          setIsLoading(false);
        } else {
          console.error('VideoPlayer: HLS is not supported in this browser');
          setIsLoading(false);
        }
      } else {
        console.log('VideoPlayer: Loading regular video');
        // Regular video
        video.src = src;
      }
    };

    const handleLoadedMetadata = () => {
      console.log('VideoPlayer: Video metadata loaded');
      if (!isLive) {
        setDuration(video.duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      console.log('VideoPlayer: Video started playing');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('VideoPlayer: Video paused');
      setIsPlaying(false);
    };
    
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleCanPlay = () => {
      console.log('VideoPlayer: Video can play');
      setIsLoading(false);
    };

    const handleError = () => {
      console.error('VideoPlayer: Video error occurred');
      setIsLoading(false);
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Initialize the video
    initializeVideo();

    return () => {
      console.log('VideoPlayer: Cleaning up video event listeners');
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      
      // Cleanup HLS
      if (hlsRef.current) {
        console.log('VideoPlayer: Destroying HLS instance');
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isLive, accessChecked, hasAccess]); // Only reinitialize when these specific values change

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Check both document fullscreen and video fullscreen for iOS
      const isDocumentFullscreen = !!document.fullscreenElement;
      const video = videoRef.current;
      const isVideoFullscreen = video && (video as any).webkitDisplayingFullscreen;
      
      setIsFullscreen(isDocumentFullscreen || isVideoFullscreen);
    };

    const handleWebkitFullscreenChange = () => {
      const video = videoRef.current;
      if (video && isIOS()) {
        setIsFullscreen((video as any).webkitDisplayingFullscreen || false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    // iOS specific fullscreen events
    const video = videoRef.current;
    if (video && isIOS()) {
      video.addEventListener('webkitbeginfullscreen', () => setIsFullscreen(true));
      video.addEventListener('webkitendfullscreen', () => setIsFullscreen(false));
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      
      if (video && isIOS()) {
        video.removeEventListener('webkitbeginfullscreen', () => setIsFullscreen(true));
        video.removeEventListener('webkitendfullscreen', () => setIsFullscreen(false));
      }
    };
  }, []);

  const handleWatchLiveClick = useCallback(() => {
    console.log('VideoPlayer: Watch live clicked, hasAccess:', hasAccess);
    if (!hasAccess) {
      navigate('/subscription');
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.play().catch(error => {
        console.error('VideoPlayer: Autoplay failed:', error);
      });
    }
  }, [hasAccess, navigate]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !hasAccess) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying, hasAccess]);

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video || !hasAccess) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video || !hasAccess) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || !hasAccess) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!hasAccess) return;

    try {
      if (isIOS() && video) {
        // iOS: Use native video fullscreen
        console.log('VideoPlayer: Using iOS native fullscreen');
        if (!isFullscreen) {
          // Enter fullscreen
          if ((video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
          } else if ((video as any).requestFullscreen) {
            await video.requestFullscreen();
          }
        } else {
          // Exit fullscreen
          if ((video as any).webkitExitFullscreen) {
            (video as any).webkitExitFullscreen();
          } else if (document.exitFullscreen) {
            await document.exitFullscreen();
          }
        }
      } else if (container) {
        // Desktop/Android: Use container fullscreen
        console.log('VideoPlayer: Using container fullscreen');
        if (!isFullscreen) {
          await container.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    
    if (isPlaying) {
      hideControlsTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const handleVideoClick = () => {
    if (window.innerWidth <= 768) {
      showControlsTemporarily();
    } else {
      togglePlay();
    }
  };

  // Show loading state while checking access
  if (!accessChecked) {
    return (
      <div 
        className={cn(
          "relative bg-black rounded-lg overflow-hidden",
          "w-full aspect-video flex items-center justify-center",
          isFullscreen && "!aspect-auto !w-screen !h-screen !rounded-none",
          className
        )}
      >
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        "w-full aspect-video",
        isFullscreen && "!aspect-auto !w-screen !h-screen !rounded-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          hideControlsTimeout = setTimeout(() => setShowControls(false), 1000);
        }
      }}
    >
      {/* Video Element - Only render if user has access */}
      {hasAccess ? (
        <video
          ref={videoRef}
          poster={poster}
          className="w-full h-full object-cover"
          onClick={handleVideoClick}
          playsInline
          preload="metadata"
          controls={false}
          muted={isMuted}
          webkit-playsinline="true"
          x-webkit-airplay="allow"
        />
      ) : (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            <Lock className="w-16 h-16 text-white/50 mx-auto" />
            <div>
              <h3 className="text-white text-xl font-semibold">Content Locked</h3>
              <p className="text-white/70">You need access to view this content</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && hasAccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="destructive" className="bg-red-600 text-white animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            LIVE
          </Badge>
        </div>
      )}

      {/* Quality Indicator */}
      {hasAccess && (
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="secondary" className="bg-black/70 text-white border-white/20">
            {quality}
          </Badge>
        </div>
      )}

      {/* Controls Overlay - Only show if user has access */}
      {hasAccess && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40",
            "transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0",
            "flex flex-col justify-between p-4"
          )}
        >
          {/* Top Controls */}
          <div className="flex justify-between items-start">
            {title && (
              <h3 className="text-white font-semibold text-lg max-w-[70%] truncate">
                {title}
              </h3>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 border-white/20">
                <DropdownMenuItem className="text-white hover:bg-white/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Quality
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/20">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            {!isLive && (
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full cursor-pointer"
                  disabled={isLive}
                />
                <div className="flex justify-between text-white text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <div className="hidden md:block w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watch Live Button Overlay */}
      {isLive && !isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Button
            onClick={handleWatchLiveClick}
            size="lg"
            className={cn(
              "px-8 py-4 text-lg font-semibold border-2 border-white/30 rounded-full shadow-2xl transition-all duration-300 hover:scale-105",
              hasAccess 
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse hover:animate-none" 
                : "bg-gray-600 hover:bg-gray-700 text-white"
            )}
          >
            <div className="flex items-center space-x-3">
              {hasAccess ? (
                <>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span>Watch Live</span>
                  <Play className="w-5 h-5 fill-white ml-1" />
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Get Access</span>
                </>
              )}
            </div>
          </Button>
        </div>
      )}

      {/* Large Play Button (Non-Live Content) */}
      {!isLive && !isPlaying && !isLoading && hasAccess && (
        <div className="absolute inset-0 flex items-center justify-center md:hidden">
          <Button
            onClick={togglePlay}
            size="lg"
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
