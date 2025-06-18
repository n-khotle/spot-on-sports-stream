import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const TrackingScripts = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Google Analytics Script
    if (settings?.google_analytics_id) {
      // Remove existing GA scripts
      const existingGAScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
      existingGAScripts.forEach(script => script.remove());
      
      const existingGAConfig = document.querySelector('script[data-ga-config]');
      if (existingGAConfig) existingGAConfig.remove();

      // Add GA script
      const gaScript = document.createElement('script');
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
      gaScript.async = true;
      document.head.appendChild(gaScript);

      // Add GA config script
      const gaConfigScript = document.createElement('script');
      gaConfigScript.setAttribute('data-ga-config', 'true');
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.google_analytics_id}');
      `;
      document.head.appendChild(gaConfigScript);
    }

    // Meta Pixel Script
    if (settings?.meta_pixel_id) {
      // Remove existing Meta Pixel scripts
      const existingPixelScript = document.querySelector('script[data-meta-pixel]');
      if (existingPixelScript) existingPixelScript.remove();

      // Add Meta Pixel script
      const pixelScript = document.createElement('script');
      pixelScript.setAttribute('data-meta-pixel', 'true');
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.meta_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);

      // Add noscript fallback
      const existingNoscript = document.querySelector('noscript[data-meta-pixel]');
      if (existingNoscript) existingNoscript.remove();

      const noscript = document.createElement('noscript');
      noscript.setAttribute('data-meta-pixel', 'true');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.meta_pixel_id}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript);
    }

    // Cleanup function to remove scripts when component unmounts or settings change
    return () => {
      if (!settings?.google_analytics_id) {
        const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"], script[data-ga-config]');
        gaScripts.forEach(script => script.remove());
      }
      
      if (!settings?.meta_pixel_id) {
        const pixelElements = document.querySelectorAll('script[data-meta-pixel], noscript[data-meta-pixel]');
        pixelElements.forEach(element => element.remove());
      }
    };
  }, [settings?.google_analytics_id, settings?.meta_pixel_id]);

  return null; // This component doesn't render anything
};

export default TrackingScripts;