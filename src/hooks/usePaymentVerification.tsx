
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useSubscription } from './useSubscription';

export const usePaymentVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkSubscription } = useSubscription();
  const [verifying, setVerifying] = useState(false);

  const verifyPayment = async (sessionId: string) => {
    if (!sessionId) return false;
    
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.success && data?.status === 'paid') {
        toast({
          title: "Payment Successful!",
          description: data.allocated && data.productName ? 
            `You now have access to ${data.productName}.` :
            "Your payment was successful!",
        });
        
        // Refresh subscription status after successful payment
        await checkSubscription();
        
        return true;
      } else {
        toast({
          title: "Payment Verification",
          description: "Your payment is being processed. Please wait a moment.",
          variant: "default",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
      return false;
    } finally {
      setVerifying(false);
    }
  };

  // Auto-verify payment if session_id is in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    
    if ((sessionId || success === 'true') && user) {
      console.log('Payment verification triggered:', { sessionId, success });
      
      if (sessionId) {
        verifyPayment(sessionId).then((verificationSuccess) => {
          if (verificationSuccess) {
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('session_id');
            url.searchParams.delete('success');
            window.history.replaceState({}, '', url.toString());
          }
        });
      } else if (success === 'true') {
        // Handle cases where we only have success=true parameter
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated.",
        });
        
        // Refresh subscription status
        checkSubscription();
        
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [user]);

  return { verifyPayment, verifying };
};
