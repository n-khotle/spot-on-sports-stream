import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPrice {
  id: string;
  stripe_price_id: string | null;
  unit_amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  nickname: string | null;
  active: boolean;
}

interface SubscriptionProduct {
  id: string;
  name: string;
  description: string | null;
  stripe_product_id: string | null;
  active: boolean;
  prices: SubscriptionPrice[];
}

const Subscription = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { subscribed, subscriptionTier, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchSubscriptionProducts();
    }
  }, [user, authLoading, navigate]);

  const fetchSubscriptionProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("subscription_products")
        .select(`
          *,
          subscription_prices (*)
        `)
        .eq("active", true);

      if (productsError) throw productsError;

      const formattedProducts = (productsData || []).map(product => ({
        ...product,
        prices: (product.subscription_prices || []).filter((price: any) => price.active)
      })).filter(product => product.prices.length > 0);

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching subscription products:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setSubscribing(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: {
          priceId,
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start subscription process",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  const formatPrice = (amount: number, currency: string, interval: string) => {
    const price = (amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    return interval === 'once' ? price : `${price}/${interval}`;
  };

  const getProductIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("premium") || lowerName.includes("pro")) {
      return <Crown className="w-6 h-6 text-primary" />;
    }
    return <Star className="w-6 h-6 text-primary" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-lg">Loading subscription plans...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get unlimited access to live streams, exclusive content, and premium features.
          </p>
        </div>

        {subscribed && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                You have an active {subscriptionTier} subscription
              </span>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No subscription plans available at the moment.</p>
            <p className="text-muted-foreground text-sm">Please check back later!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product) => (
              <Card key={product.id} className="relative border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {getProductIcon(product.name)}
                  </div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  {product.description && (
                    <p className="text-muted-foreground">{product.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.prices.map((price) => (
                    <div key={price.id} className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        {formatPrice(price.unit_amount, price.currency, price.interval)}
                      </div>
                      {price.nickname && (
                        <Badge variant="secondary" className="mb-4">
                          {price.nickname}
                        </Badge>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => price.stripe_price_id && handleSubscribe(price.stripe_price_id)}
                        disabled={!price.stripe_price_id || subscribing === price.stripe_price_id || subLoading}
                      >
                        {subscribing === price.stripe_price_id
                          ? "Processing..."
                          : subscribed
                          ? "Change Plan"
                          : "Subscribe Now"
                        }
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {subscribed && (
          <div className="text-center mt-12">
            <Button 
              variant="outline"
              onClick={() => {
                // This would open the customer portal for managing subscription
                supabase.functions.invoke("customer-portal", {
                  headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                  },
                }).then(({ data }) => {
                  if (data?.url) {
                    window.open(data.url, "_blank");
                  }
                });
              }}
            >
              Manage Subscription
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Subscription;