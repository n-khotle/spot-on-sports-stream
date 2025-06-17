import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  Download,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  isLive?: boolean;
  className?: string;
}

const VideoPlayer = ({ src, poster, title, isLive = false, className }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [quality, setQuality] = useState('Auto');

  let hideControlsTimeout: NodeJS.Timeout;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
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
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onClick={handleVideoClick}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        playsInline
        preload="metadata"
      />

      {/* Loading Spinner */}
      {isLoading && (
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
      <div className="absolute top-4 right-4 z-20">
        <Badge variant="secondary" className="bg-black/70 text-white border-white/20">
          {quality}
        </Badge>
      </div>

      {/* Controls Overlay */}
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

      {/* Large Play Button (Mobile) */}
      {!isPlaying && !isLoading && (
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