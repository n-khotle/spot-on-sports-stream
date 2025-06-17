import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import NewsImageUpload from "./NewsImageUpload";
import NewsVideoUpload from "./NewsVideoUpload";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

interface NewsArticleFormProps {
  article?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const NewsArticleForm = ({ article, onSuccess, onCancel }: NewsArticleFormProps) => {
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(article?.featured_image_url || null);
  const [videoUrl, setVideoUrl] = useState<string | null>(article?.video_url || null);
  const [tagList, setTagList] = useState<string[]>(article?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || "",
      excerpt: article?.excerpt || "",
      content: article?.content || "",
      tags: "",
      published: article?.published || false,
      featured: article?.featured || false,
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tagList.includes(newTag.trim())) {
      setTagList([...tagList, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTagList(tagList.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create articles",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const articleData = {
        title: values.title,
        content: values.content,
        excerpt: values.excerpt || null,
        featured_image_url: featuredImageUrl,
        video_url: videoUrl,
        author_id: user.id,
        author_name: user.email?.split('@')[0] || 'Unknown',
        published: values.published,
        featured: values.featured,
        tags: tagList.length > 0 ? tagList : null,
      };

      let error;

      if (article) {
        // Update existing article
        const { error: updateError } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', article.id);
        error = updateError;
      } else {
        // Create new article
        const { error: insertError } = await supabase
          .from('news_articles')
          .insert(articleData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Article ${article ? 'updated' : 'created'} successfully!`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {article ? 'Edit Article' : 'Create New Article'}
        </h3>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter article title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter a brief excerpt..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write your article content..."
                    rows={10}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags Section */}
          <div className="space-y-3">
            <FormLabel>Tags</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Media Uploads */}
          <div className="grid md:grid-cols-2 gap-6">
            <NewsImageUpload
              onImageUploaded={setFeaturedImageUrl}
              currentImageUrl={featuredImageUrl}
              onImageRemoved={() => setFeaturedImageUrl(null)}
            />
            
            <NewsVideoUpload
              onVideoUploaded={setVideoUrl}
              currentVideoUrl={videoUrl}
              onVideoRemoved={() => setVideoUrl(null)}
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Publish Article
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Feature Article
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (article ? 'Update Article' : 'Create Article')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewsArticleForm;