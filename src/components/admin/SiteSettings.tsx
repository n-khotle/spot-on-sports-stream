import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Save, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
}

const SiteSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [siteName, setSiteName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setSiteName(data.site_name);
        setLogoPreview(data.logo_url);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast({
        title: "Error",
        description: "Failed to load site settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('site-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const saveSiteSettings = async () => {
    setSaving(true);
    try {
      let logoUrl = settings?.logo_url;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const settingsData = {
        site_name: siteName,
        logo_url: logoUrl,
      };

      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('site_settings')
          .insert(settingsData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Site settings saved successfully",
      });

      // Refresh settings
      await fetchSiteSettings();
      setLogoFile(null);
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({
        title: "Error",
        description: "Failed to save site settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading site settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Site Name */}
        <div className="space-y-2">
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Enter site name"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>Site Logo</Label>
          
          {/* Current Logo Preview */}
          {logoPreview && (
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 border rounded-lg overflow-hidden bg-secondary">
                <img 
                  src={logoPreview} 
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Current logo
              </div>
            </div>
          )}

          {/* Upload Input */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <Label 
                htmlFor="logo-upload"
                className="flex items-center space-x-2 cursor-pointer bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Logo</span>
              </Label>
              {logoFile && (
                <span className="text-sm text-muted-foreground">
                  {logoFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: PNG or SVG format, max 2MB
            </p>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={saveSiteSettings}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;