import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("bwp");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const getCurrencySymbol = (curr: string) => curr === "bwp" ? "P" : "$";
  const getOneTimePrice = () => currency === "bwp" ? "15.00" : "1.15";
  const getBasicPrice = () => currency === "bwp" ? "15.00" : "1.15";
  const getPremiumPrice = () => currency === "bwp" ? "30.00" : "2.30";
  const getEnterprisePrice = () => currency === "bwp" ? "75.00" : "5.75";

  const handleOneTimePayment = async () => {
    setLoading(true);
    try {
      // For one-time payments, we'll use a default product ID
      // In a real implementation, you might want to create specific products for games
      const defaultProductId = "default-game-access-product";
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          gameId, 
          amount: currency === "bwp" ? 1500 : 115, 
          currency,
          productId: defaultProductId
        },
        headers: user ? { Authorization: `Bearer ${session?.access_token}` } : {}
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
        body: { tier, currency },
        headers: { Authorization: `Bearer ${session?.access_token}` }
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

        {/* Currency Selector */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <label className="text-sm font-medium">Currency:</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD ($)</SelectItem>
              <SelectItem value="bwp">BWP (P)</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                  <div className="text-4xl font-bold text-primary">{getCurrencySymbol(currency)}{getOneTimePrice()}</div>
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
                  {user && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Automatic access after payment</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleOneTimePayment}
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : `Buy Now - ${getCurrencySymbol(currency)}${getOneTimePrice()}`}
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
                  <div className="text-3xl font-bold">{getCurrencySymbol(currency)}{getBasicPrice()}<span className="text-sm font-normal">/month</span></div>
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
                  <div className="text-3xl font-bold">{getCurrencySymbol(currency)}{getPremiumPrice()}<span className="text-sm font-normal">/month</span></div>
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
                  <div className="text-3xl font-bold">{getCurrencySymbol(currency)}{getEnterprisePrice()}<span className="text-sm font-normal">/month</span></div>
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
