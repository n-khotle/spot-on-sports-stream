
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSubscription } from "@/hooks/useSubscription";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful payment
    checkSubscription();
  }, [checkSubscription]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300 text-lg">
                Thank you for your purchase. You now have access to premium content.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-lg mb-2">What's Next?</h3>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Access to all live streams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    HD/4K quality streaming
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Premium content library
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Multi-device support
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="min-h-[44px]" asChild>
                  <Link to="/live">
                    <Play className="w-4 h-4 mr-2" />
                    Start Watching
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="min-h-[44px]" asChild>
                  <Link to="/">
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
