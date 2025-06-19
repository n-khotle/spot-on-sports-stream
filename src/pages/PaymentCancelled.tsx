
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PaymentCancelled = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-800 dark:text-orange-200">
                Payment Cancelled
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300 text-lg">
                Your payment was cancelled. No charges were made to your account.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold text-lg mb-2">What happened?</h3>
                <p className="text-muted-foreground text-left">
                  You cancelled the payment process or there was an issue processing your payment. 
                  Don't worry - no charges were made to your payment method.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="min-h-[44px]" asChild>
                  <Link to="/">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Try Again
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="min-h-[44px]" asChild>
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Need help? <Link to="/help-center" className="text-primary hover:underline">Contact our support team</Link></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentCancelled;
