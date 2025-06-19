import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const CancellationPolicy = () => {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('Cancellation Policy (Applicable to future Subscription/VOD Services)');
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   fetchPageContent();
  // }, []);

  // const fetchPageContent = async () => {
  //   // try {
  //   //   const { data, error } = await supabase
  //   //     .from('pages')
  //   //     .select('title, content')
  //   //     .eq('slug', 'cancellation-policy')
  //   //     .single();

  //   //   if (error) throw error;
      
  //   //   if (data) {
  //   //     setTitle(data.title);
  //   //     setContent(data.content);
  //   //   }
  //   // } catch (error) {
  //   //   console.error('Error fetching page content:', error);
  //   // } finally {
  //   //   setIsLoading(false);
  //   // }
  // };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
 
            <>
              <h1 className="text-4xl font-bold mb-8">{title}</h1>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    This policy will become relevant when Spot On introduces subscription-based or VOD "Catch Up" services.
                  </p>
                </div>
                <br/>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Subscription Cancellation
                  </p>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Users will be able to cancel their recurring subscriptions at any time through their account settings on the Spot On website.
                  </p>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Cancellation will take effect at the end of the current billing period.
                  </p>
                </div>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Access After Cancellation
                  </p>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Upon cancellation, you will retain access to the subscription benefits until the end of your current paid billing cycle.
                  </p>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o No refunds will be issued for any unused portion of a subscription period (e.g., if you cancel halfway through a monthly subscription, you will not be refunded for the remaining half).
                  </p>
                </div>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Re-subscription
                  </p>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o You are free to re-subscribe to Spot On's services at any time after cancellation.
                  </p>
                </div>
              </div>
            </>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;