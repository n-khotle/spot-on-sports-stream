import { Play, Facebook, Twitter, Instagram, Music } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();
  
  return (
    <footer className="bg-secondary py-8 sm:py-12 mt-12 sm:mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-4 text-center sm:text-left lg:col-span-1">
            <div className="flex items-center justify-center sm:justify-start">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary-foreground fill-current" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              The ultimate destination for live sports streaming. Never miss a moment.
            </p>
            
            {/* Social Media Icons */}
            {(settings?.facebook_handle || settings?.x_handle || settings?.instagram_handle || settings?.tiktok_handle) && (
              <div className="flex items-center justify-center sm:justify-start space-x-4 mt-4">
                {settings?.facebook_handle && (
                  <a 
                    href={`https://facebook.com/${settings.facebook_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings?.x_handle && (
                  <a 
                    href={`https://x.com/${settings.x_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {settings?.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${settings.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings?.tiktok_handle && (
                  <a 
                    href={`https://tiktok.com/@${settings.tiktok_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="TikTok"
                  >
                    <Music className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="font-semibold mb-3 sm:mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li><a href="/help-center" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li><a href="/about-us" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">&copy; 2024 {settings?.site_name || 'Spot On'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;