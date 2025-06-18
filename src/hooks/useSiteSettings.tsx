import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  instagram_handle: string | null;
  facebook_handle: string | null;
  x_handle: string | null;
  tiktok_handle: string | null;
  google_analytics_id: string | null;
  meta_pixel_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  return {
    settings,
    loading,
    refetch: fetchSiteSettings
  };
};