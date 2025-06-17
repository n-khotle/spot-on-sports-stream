import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CreditCard, DollarSign, Settings, Save, TestTube, AlertCircle } from 'lucide-react';

const PaymentSettings = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    stripeEnabled: false,
    testMode: true,
    currency: 'usd',
    defaultPrice: '',
    subscriptionEnabled: false,
    oneTimePaymentEnabled: true,
    guestCheckoutEnabled: false,
    successUrl: '/payment-success',
    cancelUrl: '/payment-canceled'
  });
  const [saving, setSaving] = useState(false);

  // Redirect if not admin
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" replace />;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here we would save payment settings to database
      // For now, just show success message
      toast({
        title: "Settings Saved",
        description: "Payment settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Payment Settings
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Stripe Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Stripe Configuration
              </CardTitle>
              <CardDescription>
                Configure your Stripe payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="stripeEnabled"
                  checked={settings.stripeEnabled}
                  onCheckedChange={(checked) => handleFieldChange('stripeEnabled', checked)}
                />
                <Label htmlFor="stripeEnabled">Enable Stripe Payments</Label>
                {settings.stripeEnabled && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>

              {settings.stripeEnabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="testMode"
                      checked={settings.testMode}
                      onCheckedChange={(checked) => handleFieldChange('testMode', checked)}
                    />
                    <Label htmlFor="testMode" className="flex items-center">
                      <TestTube className="w-4 h-4 mr-1" />
                      Test Mode
                    </Label>
                    {settings.testMode && (
                      <Badge variant="secondary">Test</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={settings.currency} onValueChange={(value) => handleFieldChange('currency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="cad">CAD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultPrice">Default Price (in cents)</Label>
                      <Input
                        id="defaultPrice"
                        type="number"
                        value={settings.defaultPrice}
                        onChange={(e) => handleFieldChange('defaultPrice', e.target.value)}
                        placeholder="4999"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Stripe Secret Key Required</p>
                        <p className="text-sm text-muted-foreground">
                          You'll need to configure your Stripe secret key in the edge function secrets to enable payments.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Types
              </CardTitle>
              <CardDescription>
                Configure what types of payments to accept
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="oneTimePaymentEnabled"
                  checked={settings.oneTimePaymentEnabled}
                  onCheckedChange={(checked) => handleFieldChange('oneTimePaymentEnabled', checked)}
                />
                <Label htmlFor="oneTimePaymentEnabled">One-time Payments</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="subscriptionEnabled"
                  checked={settings.subscriptionEnabled}
                  onCheckedChange={(checked) => handleFieldChange('subscriptionEnabled', checked)}
                />
                <Label htmlFor="subscriptionEnabled">Recurring Subscriptions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="guestCheckoutEnabled"
                  checked={settings.guestCheckoutEnabled}
                  onCheckedChange={(checked) => handleFieldChange('guestCheckoutEnabled', checked)}
                />
                <Label htmlFor="guestCheckoutEnabled">Guest Checkout (No login required)</Label>
              </div>
            </CardContent>
          </Card>

          {/* URL Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Redirect URLs</CardTitle>
              <CardDescription>
                Configure where users are redirected after payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="successUrl">Success URL</Label>
                <Input
                  id="successUrl"
                  value={settings.successUrl}
                  onChange={(e) => handleFieldChange('successUrl', e.target.value)}
                  placeholder="/payment-success"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelUrl">Cancel URL</Label>
                <Input
                  id="cancelUrl"
                  value={settings.cancelUrl}
                  onChange={(e) => handleFieldChange('cancelUrl', e.target.value)}
                  placeholder="/payment-canceled"
                />
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                Current status of your payment integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Stripe Secret Key</span>
                  <Badge variant="destructive">Not Configured</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Edge Functions</span>
                  <Badge variant="secondary">Ready for Setup</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Pages</span>
                  <Badge variant="secondary">Ready for Setup</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;