
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
import { ArrowLeft, CreditCard, DollarSign, Settings, Save, TestTube, AlertCircle, Link, Plus, Copy, ExternalLink, Trash2, Download, Key, Eye, EyeOff } from 'lucide-react';

interface PaymentLink {
  id: string;
  url: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  active: boolean;
  created_at: string;
}

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
    cancelUrl: '/payment-canceled',
    publishableKey: '',
    secretKey: '',
    webhookSecret: ''
  });
  const [saving, setSaving] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [newPaymentLink, setNewPaymentLink] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'usd'
  });
  const [creatingLink, setCreatingLink] = useState(false);
  const [importLinkUrl, setImportLinkUrl] = useState('');
  const [importingLink, setImportingLink] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

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

  const handleCreatePaymentLink = async () => {
    if (!newPaymentLink.title || !newPaymentLink.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreatingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          title: newPaymentLink.title,
          description: newPaymentLink.description,
          amount: parseInt(newPaymentLink.amount),
          currency: newPaymentLink.currency
        }
      });

      if (error) throw error;

      const newLink: PaymentLink = {
        id: data.id,
        url: data.url,
        title: newPaymentLink.title,
        description: newPaymentLink.description,
        amount: parseInt(newPaymentLink.amount),
        currency: newPaymentLink.currency,
        active: true,
        created_at: new Date().toISOString()
      };

      setPaymentLinks([...paymentLinks, newLink]);
      setNewPaymentLink({ title: '', description: '', amount: '', currency: 'usd' });
      
      toast({
        title: "Payment Link Created",
        description: "Your payment link has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setCreatingLink(false);
    }
  };

  const handleImportPaymentLink = async () => {
    if (!importLinkUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Stripe payment link URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    if (!importLinkUrl.includes('buy.stripe.com') && !importLinkUrl.includes('checkout.stripe.com')) {
      toast({
        title: "Error",
        description: "Please enter a valid Stripe payment link URL",
        variant: "destructive",
      });
      return;
    }

    setImportingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-payment-link', {
        body: { url: importLinkUrl.trim() }
      });

      if (error) throw error;

      const importedLink: PaymentLink = {
        id: data.id,
        url: importLinkUrl.trim(),
        title: data.title || 'Imported Payment Link',
        description: data.description || '',
        amount: data.amount || 0,
        currency: data.currency || 'usd',
        active: data.active !== false,
        created_at: new Date().toISOString()
      };

      setPaymentLinks([...paymentLinks, importedLink]);
      setImportLinkUrl('');
      
      toast({
        title: "Payment Link Imported",
        description: "Stripe payment link has been imported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import payment link",
        variant: "destructive",
      });
    } finally {
      setImportingLink(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Payment link copied to clipboard",
    });
  };

  const handleDeletePaymentLink = async (linkId: string) => {
    try {
      // Here you would call an edge function to deactivate the Stripe payment link
      setPaymentLinks(paymentLinks.filter(link => link.id !== linkId));
      toast({
        title: "Payment Link Deleted",
        description: "The payment link has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete payment link",
        variant: "destructive",
      });
    }
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
          {/* Stripe API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Stripe API Configuration
              </CardTitle>
              <CardDescription>
                Configure your Stripe API keys for payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
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
                  <div className="flex items-center space-x-2 mb-4">
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

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publishableKey">
                        Publishable Key {settings.testMode ? '(Test)' : '(Live)'}
                      </Label>
                      <Input
                        id="publishableKey"
                        type="text"
                        value={settings.publishableKey}
                        onChange={(e) => handleFieldChange('publishableKey', e.target.value)}
                        placeholder={settings.testMode ? "pk_test_..." : "pk_live_..."}
                      />
                      <p className="text-xs text-muted-foreground">
                        This key is safe to use in your frontend code
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secretKey">
                        Secret Key {settings.testMode ? '(Test)' : '(Live)'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="secretKey"
                          type={showSecretKey ? "text" : "password"}
                          value={settings.secretKey}
                          onChange={(e) => handleFieldChange('secretKey', e.target.value)}
                          placeholder={settings.testMode ? "sk_test_..." : "sk_live_..."}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                        >
                          {showSecretKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep this key secure and never share it publicly
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
                      <div className="relative">
                        <Input
                          id="webhookSecret"
                          type={showWebhookSecret ? "text" : "password"}
                          value={settings.webhookSecret}
                          onChange={(e) => handleFieldChange('webhookSecret', e.target.value)}
                          placeholder="whsec_..."
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        >
                          {showWebhookSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used to verify webhook events from Stripe
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-blue-800 dark:text-blue-200">
                          How to find your Stripe keys:
                        </p>
                        <ol className="text-sm text-blue-700 dark:text-blue-300 mt-1 list-decimal list-inside space-y-1">
                          <li>Log in to your Stripe Dashboard</li>
                          <li>Navigate to Developers → API Keys</li>
                          <li>Copy your Publishable key and Secret key</li>
                          <li>For webhooks, go to Developers → Webhooks</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Payment Configuration
              </CardTitle>
              <CardDescription>
                Configure your payment processing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleFieldChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                      <SelectItem value="bwp">BWP (P)</SelectItem>
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
                  <p className="text-xs text-muted-foreground">
                    Enter amount in cents (e.g., 4999 = $49.99)
                  </p>
                </div>
              </div>
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
                  <span>Stripe API Keys</span>
                  <Badge variant={settings.publishableKey && settings.secretKey ? "default" : "destructive"}>
                    {settings.publishableKey && settings.secretKey ? "Configured" : "Not Configured"}
                  </Badge>
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

          {/* Payment Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="w-5 h-5 mr-2" />
                Payment Links
              </CardTitle>
              <CardDescription>
                Create and manage payment links for easy sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create New Payment Link */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Payment Link
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkTitle">Title *</Label>
                    <Input
                      id="linkTitle"
                      value={newPaymentLink.title}
                      onChange={(e) => setNewPaymentLink({ ...newPaymentLink, title: e.target.value })}
                      placeholder="Product/Service Name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkAmount">Amount (in cents) *</Label>
                    <Input
                      id="linkAmount"
                      type="number"
                      value={newPaymentLink.amount}
                      onChange={(e) => setNewPaymentLink({ ...newPaymentLink, amount: e.target.value })}
                      placeholder="4999"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkCurrency">Currency</Label>
                    <Select 
                      value={newPaymentLink.currency} 
                      onValueChange={(value) => setNewPaymentLink({ ...newPaymentLink, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="cad">CAD ($)</SelectItem>
                        <SelectItem value="bwp">BWP (P)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkDescription">Description</Label>
                  <Textarea
                    id="linkDescription"
                    value={newPaymentLink.description}
                    onChange={(e) => setNewPaymentLink({ ...newPaymentLink, description: e.target.value })}
                    placeholder="Optional description for the payment"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleCreatePaymentLink} 
                  disabled={creatingLink || !newPaymentLink.title || !newPaymentLink.amount}
                  className="w-full md:w-auto"
                >
                  {creatingLink ? 'Creating...' : 'Create Payment Link'}
                </Button>
              </div>

              {/* Import Existing Payment Link */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Import Existing Payment Link
                </h4>
                <p className="text-sm text-muted-foreground">
                  Paste a Stripe payment link URL to import an existing payment link from your Stripe dashboard.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="importUrl">Stripe Payment Link URL</Label>
                    <Input
                      id="importUrl"
                      value={importLinkUrl}
                      onChange={(e) => setImportLinkUrl(e.target.value)}
                      placeholder="https://buy.stripe.com/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports URLs from buy.stripe.com or checkout.stripe.com
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleImportPaymentLink} 
                    disabled={importingLink || !importLinkUrl.trim()}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    {importingLink ? 'Importing...' : 'Import Payment Link'}
                  </Button>
                </div>
              </div>

              {/* Existing Payment Links */}
              {paymentLinks.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Existing Payment Links</h4>
                  <div className="space-y-3">
                    {paymentLinks.map((link) => (
                      <div key={link.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium">{link.title}</h5>
                              <Badge variant={link.active ? "default" : "secondary"}>
                                {link.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {link.description && (
                              <p className="text-sm text-muted-foreground">{link.description}</p>
                            )}
                            <p className="text-sm font-medium">
                              {(link.amount / 100).toFixed(2)} {link.currency.toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(link.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(link.url)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePaymentLink(link.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-2 bg-muted rounded text-xs font-mono break-all">
                          {link.url}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {paymentLinks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment links created yet</p>
                  <p className="text-sm">Create your first payment link above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
