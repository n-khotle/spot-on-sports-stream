import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type PageFormData = z.infer<typeof pageSchema>;

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
}

interface PageFormProps {
  editingPage: Page | null;
  onPageSaved: () => void;
  onCancel: () => void;
}

const PageForm = ({ editingPage, onPageSaved, onCancel }: PageFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (editingPage) {
      form.reset({
        title: editingPage.title,
        content: editingPage.content,
      });
    } else {
      form.reset({
        title: '',
        content: '',
      });
    }
  }, [editingPage, form]);

  const onSubmit = async (data: PageFormData) => {
    if (!editingPage) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title: data.title,
          content: data.content,
        })
        .eq('id', editingPage.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Page updated successfully',
      });

      onPageSaved();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update page',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!editingPage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Page Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a page from the table to edit its content.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Page: {editingPage.slug}</CardTitle>
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
                    <Input placeholder="Enter page title" {...field} />
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
                      placeholder="Enter page content"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PageForm;