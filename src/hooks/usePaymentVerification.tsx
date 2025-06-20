
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from './useSubscription';

export const usePaymentVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();
  const [verifying, setVerifying] = useState(false);

  const verifyPayment = async (sessionId: string) => {
    if (!sessionId) {
      console.log('No session ID provided for verification');
      return false;
    }
    
    console.log('Starting payment verification for session:', sessionId);
    setVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      console.log('Payment verification response:', { data, error });

      if (error) {
        console.error('Payment verification error:', error);
        throw error;
      }

      if (data?.success && data?.status === 'paid') {
        console.log('Payment verification successful:', data);
        
        toast({
          title: "Payment Successful!",
          description: data.allocated && data.productName ? 
            `You now have access to ${data.productName}. Redirecting to live stream...` :
            "Your payment was successful!",
        });
        
        // Refresh subscription status after successful payment
        console.log('Refreshing subscription status...');
        await checkSubscription();
        
        // Always redirect to live page after successful payment
        setTimeout(() => {
          console.log('Redirecting to live page');
          navigate('/live');
        }, 1500);
        
        return true;
      } else {
        console.log('Payment verification pending or failed:', data);
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

  const handleSuccessPayment = async () => {
    if (!user) {
      console.log('No user found for success payment handling');
      return false;
    }

    console.log('Handling success=true payment for user:', user.email);
    setVerifying(true);

    try {
      // Call the verify-payment function with special success handling
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { 
          successPayment: true,
          userEmail: user.email 
        }
      });

      console.log('Success payment verification response:', { data, error });

      if (error) {
        console.error('Success payment verification error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('Success payment verification successful:', data);
        
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated. Checking your access...",
        });
        
        // Refresh subscription status after successful payment
        console.log('Refreshing subscription status...');
        await checkSubscription();
        
        // Redirect to live page after successful payment
        setTimeout(() => {
          console.log('Redirecting to live page');
          navigate('/live');
        }, 1500);
        
        return true;
      } else {
        console.log('Success payment verification failed:', data);
        return false;
      }
    } catch (error: any) {
      console.error('Success payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "There was an issue processing your payment. Please contact support.",
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
    
    console.log('URL params check:', { sessionId, success, user: !!user });
    
    if (user && (sessionId || success === 'true')) {
      console.log('Payment verification triggered:', { sessionId, success });
      
      if (sessionId) {
        console.log('Verifying payment with session ID:', sessionId);
        verifyPayment(sessionId).then((verificationSuccess) => {
          console.log('Payment verification result:', verificationSuccess);
          if (verificationSuccess) {
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('session_id');
            url.searchParams.delete('success');
            window.history.replaceState({}, '', url.toString());
            console.log('URL cleaned up');
          }
        });
      } else if (success === 'true') {
        console.log('Handling success=true parameter');
        handleSuccessPayment().then((verificationSuccess) => {
          console.log('Success payment handling result:', verificationSuccess);
          if (verificationSuccess) {
            // Clean up URL
            const url = new URL(window.location.href);
            url.searchParams.delete('success');
            window.history.replaceState({}, '', url.toString());
            console.log('URL cleaned up');
          }
        });
      }
    }
  }, [user]);

  return { verifyPayment, verifying };
};
