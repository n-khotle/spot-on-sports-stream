import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdBanner {
  id: string;
  title: string;
  image_url: string;
  click_url?: string;
  is_active: boolean;
  created_at: string;
}

const AdvertisingBanner = () => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    fetchActiveBanners();
  }, []);

  useEffect(() => {
    // Auto-rotate banners every 10 seconds if multiple banners exist
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchActiveBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("ad_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      // Fallback to empty array if fetch fails
      setBanners([]);
    }
  };

  const handleBannerClick = (banner: AdBanner) => {
    if (banner.click_url && banner.click_url !== "#") {
      // Track click event here if needed
      window.open(banner.click_url, "_blank", "noopener,noreferrer");
    }
  };

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <section className="py-8 sm:py-12 bg-background border-t border-border/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group">
          {/* Banner Container */}
          <div 
            className={`relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/10 shadow-lg hover:shadow-xl transition-all duration-300 ${
              currentBanner.click_url && currentBanner.click_url !== "#" ? "cursor-pointer" : ""
            }`}
            onClick={() => handleBannerClick(currentBanner)}
          >
            {/* Banner Image */}
            <div className="bg-gradient-to-r from-secondary to-secondary/50">
              <img 
                src={currentBanner.image_url}
                alt={currentBanner.title}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
              
              {/* Overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20"></div>
            </div>

            {/* Optional overlay content */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/20">
                <span className="text-sm font-medium text-foreground">
                  {currentBanner.click_url && currentBanner.click_url !== "#" ? "Click to learn more" : currentBanner.title}
                </span>
              </div>
            </div>
          </div>

          {/* Banner Indicators */}
          {banners.length > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentBannerIndex 
                      ? "bg-primary scale-125" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  onClick={() => setCurrentBannerIndex(index)}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Advertisement Label */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs text-muted-foreground px-2 py-1 rounded border border-border/20">
            Advertisement
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisingBanner;