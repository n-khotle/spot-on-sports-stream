import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const HelpCenter = () => {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('Help Center');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('title, content')
        .eq('slug', 'help-center')
        .single();

      if (error) throw error;
      
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-8">{title}</h1>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;