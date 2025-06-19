
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

export const usePaymentVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
          description: data.allocated ? 
            "Your payment was successful and you now have access to the content." :
            "Your payment was successful!",
        });
        
        // Redirect to live page after successful payment
        setTimeout(() => {
          navigate('/live');
        }, 2000);
        
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
    
    if (sessionId && user) {
      verifyPayment(sessionId).then((success) => {
        if (success) {
          // Clean up URL
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        }
      });
    }
  }, [user]);

  return { verifyPayment, verifying };
};
