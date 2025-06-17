import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Play, CreditCard, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameTitle?: string;
  gameId?: string;
}

const PaymentModal = ({ open, onOpenChange, gameTitle, gameId }: PaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleOneTimePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { gameId, amount: 999 },
        headers: user ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {}
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = async (tier: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier },
        headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Access</DialogTitle>
          <DialogDescription>
            {gameTitle ? `Get access to ${gameTitle}` : 'Select your preferred payment option'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="one-time" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="one-time">One-Time Access</TabsTrigger>
            <TabsTrigger value="subscription">Monthly Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="one-time" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Single Game Access
                </CardTitle>
                <CardDescription>
                  Watch this game only - perfect for occasional viewers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$9.99</div>
                  <div className="text-sm text-muted-foreground">One-time payment</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">HD streaming quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Access for 24 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">No subscription required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Works for guest users</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleOneTimePayment}
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Buy Now - $9.99'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            {!user && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="text-center text-amber-800 dark:text-amber-200">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold">Login Required</p>
                    <p className="text-sm">You need to login to subscribe to monthly plans</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {/* Basic Plan */}
              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle>Basic</CardTitle>
                  <CardDescription>Perfect for casual viewers</CardDescription>
                  <div className="text-3xl font-bold">$9.99<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">HD streaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Unlimited games</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Mobile & desktop</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleSubscription('basic')}
                    disabled={loading || !user}
                  >
                    Choose Basic
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="relative border-primary shadow-lg">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
                <CardHeader className="text-center">
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>Best value for regular viewers</CardDescription>
                  <div className="text-3xl font-bold">$19.99<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">4K Ultra HD streaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Unlimited games</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Multiple devices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Exclusive content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleSubscription('premium')}
                    disabled={loading || !user}
                  >
                    Choose Premium
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For sports organizations</CardDescription>
                  <div className="text-3xl font-bold">$49.99<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Everything in Premium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">White-label options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">API access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Dedicated support</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleSubscription('enterprise')}
                    disabled={loading || !user}
                  >
                    Choose Enterprise
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          <p>Secure payment processing by Stripe • Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;