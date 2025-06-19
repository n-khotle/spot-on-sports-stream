import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image_url: z.string().url("Please enter a valid URL"),
  click_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  is_active: z.boolean(),
  display_order: z.number().min(0, "Display order must be 0 or greater"),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  banner?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const BannerForm = ({ banner, onClose, onSuccess }: BannerFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: banner?.title || "",
      image_url: banner?.image_url || "",
      click_url: banner?.click_url || "",
      is_active: banner?.is_active ?? true,
      display_order: banner?.display_order || 0,
    },
  });

  const onSubmit = async (data: BannerFormData) => {
    setLoading(true);
    try {
      // Prepare data for database insertion
      const bannerData = {
        title: data.title,
        image_url: data.image_url,
        click_url: data.click_url || null,
        is_active: data.is_active,
        display_order: data.display_order
      };

      if (banner) {
        // Update existing banner
        const { error } = await supabase
          .from("ad_banners")
          .update(bannerData)
          .eq("id", banner.id);

        if (error) throw error;
        toast({ title: "Banner updated successfully" });
      } else {
        // Create new banner
        const { error } = await supabase
          .from("ad_banners")
          .insert(bannerData);

        if (error) throw error;
        toast({ title: "Banner created successfully" });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast({
        title: "Error",
        description: "Failed to save banner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle>{banner ? "Edit Banner" : "Create New Banner"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter banner title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="click_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Click URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BannerForm;