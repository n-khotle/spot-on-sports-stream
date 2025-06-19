import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BannerImageUpload from "./BannerImageUpload";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image_url: z.string().url("Please enter a valid URL"),
  click_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  is_active: z.boolean(),
  display_order: z.number().min(0),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  banner?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const BannerForm = ({ banner, onSuccess, onCancel }: BannerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    
    try {
      if (banner) {
        // Update existing banner
        const { error } = await supabase
          .from("ad_banners")
          .update({
            title: data.title,
            image_url: data.image_url,
            click_url: data.click_url || null,
            is_active: data.is_active,
            display_order: data.display_order,
          })
          .eq("id", banner.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Banner updated successfully",
        });
      } else {
        // Create new banner
        const { error } = await supabase
          .from("ad_banners")
          .insert({
            title: data.title,
            image_url: data.image_url,
            click_url: data.click_url || null,
            is_active: data.is_active,
            display_order: data.display_order,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Banner created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Banner title" {...field} />
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
              <FormLabel>Banner Image</FormLabel>
              <FormControl>
                <BannerImageUpload
                  onImageUrlChange={field.onChange}
                  currentImageUrl={field.value}
                />
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
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Display this banner on the website
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BannerForm;