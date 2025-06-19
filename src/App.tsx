import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useEffect } from "react";
import TrackingScripts from "@/components/TrackingScripts";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentSettings from "./pages/PaymentSettings";
import Schedule from "./pages/Schedule";
import Subscription from "./pages/Subscription";
import News from "./pages/News";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpCenter from "./pages/HelpCenter";
import Live from "./pages/Live";
import NotFound from "./pages/NotFound";
import CancellationPolicy from "./pages/CancellationPolicy";

const queryClient = new QueryClient();

const AppContent = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      // Update document title
      document.title = settings.site_name;
      
      // Update favicon if logo_url is available
      if (settings.logo_url) {
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
          existingFavicon.setAttribute('href', settings.logo_url);
        } else {
          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.href = settings.logo_url;
          newFavicon.type = 'image/png';
          document.head.appendChild(newFavicon);
        }
      }

      // Update meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', settings.site_name);
      }

      const description = document.querySelector('meta[name="description"]');
      if (description) {
        description.setAttribute('content', `${settings.site_name} - Your premier destination for sports streaming and news`);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', `${settings.site_name} - Your premier destination for sports streaming and news`);
      }

      // Update og:image if logo_url is available
      if (settings.logo_url) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.setAttribute('content', settings.logo_url);
        }

        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage) {
          twitterImage.setAttribute('content', settings.logo_url);
        }
      }
    }
  }, [settings]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/live" element={<Live />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/news" element={<News />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/refund-policy" element={<PrivacyPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsOfService />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/payment-settings" element={<PaymentSettings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <TrackingScripts />
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;