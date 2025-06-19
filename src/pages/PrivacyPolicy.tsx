import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const PrivacyPolicy = () => {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('Refund Policy');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('title, content')
        .eq('slug', 'refund-policy')
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
                <div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    Welcome to Spot On! These policies govern your use of our service, including live streaming of Botswana Football League matches 
                    and future VOD content. We are committed to operating in compliance with the laws of Botswana and industry best practices.
                  </p>
                </div>
                <br/>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  At Spot On, we are committed to providing a high-quality streaming experience. Please review our refund policy below:
                </p>
                <br/>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Eligibility for Refund:
                  </p>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Refunds will only be considered in cases of <strong>proven technical issues directly attributable to Spot On's platform </strong>that prevent you from accessing and watching a purchased live match. This includes:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o Complete failure of the live stream due to Spot On's technical fault (e.g., server outage).
                    </p>
                    <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Confirmed instances of double payment for a single match or service.
                    </p>
                  </div>
                  <p style={{marginLeft: '32px'}} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Technical issues on the user's end (e.g., unstable internet connection, incompatible device, insufficient bandwidth, VPN usage to bypass geo-restrictions, or personal technical glitches) are not eligible for a refund. We recommend ensuring your system meets the minimum requirements for streaming
                  </p>
                </div>

                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Non-Refundable Circumstance:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o No refunds will be issued for change of mind or if you simply miss a match.
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o No refunds will be issued if a match has been partially watched or completed.
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o No refunds will be issued for issues arising from third-party payment gateways once the transaction is successfully processed by them.
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o No refunds will be issued for content accessed or viewed via prohibited means (e.g., shared accounts, unauthorized redistribution).
                    </p>
                  </div>
                </div>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    How to Request a Refund:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o All refund requests must be submitted within <strong>24 hours </strong> of the scheduled start time of the purchased match. For live match issues, we strongly advise contacting support <strong>immediately during the match</strong> to allow for real-time troubleshooting.
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Send an email to Support Email with the subject line "Refund Request - [Your Transaction ID]"
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Include your transaction ID, the date and time of the purchase, the name of the match, a clear and detailed description of the technical issue encountered, and any supporting evidence (e.g., screenshots, error messages, video recordings of the issue).
                    </p>
                  </div>
                </div>
                <div style={{marginLeft: '32px'}}>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap bold-small">
                    Refund Processing:
                  </p>
                  <div style={{marginLeft: '32px'}}>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      o Approved refunds will be processed within <strong>7-10 business days </strong> of the approval date.
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    o Refunds will be issued to the original payment method used for the purchase (PayPal, Visa, Payment Token).
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;