import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, X } from 'lucide-react';
import SubscriptionImageUpload from './SubscriptionImageUpload';

interface SubscriptionProduct {
  id: string;
  name: string;
  description: string | null;
  stripe_product_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

interface PriceData {
  id?: string;
  currency: string;
  unit_amount: string;
  interval: string;
  interval_count: string;
  nickname: string;
  active: boolean;
}

interface SubscriptionProductFormProps {
  product?: SubscriptionProduct | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const SubscriptionProductForm = ({ product, onClose, onSuccess }: SubscriptionProductFormProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    active: true,
  });
  const [prices, setPrices] = useState<PriceData[]>([
    {
      currency: 'usd',
      unit_amount: '',
      interval: 'month',
      interval_count: '1',
      nickname: '',
      active: true,
    }
  ]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        image_url: product.image_url || '',
        active: product.active,
      });
      fetchExistingPrices(product.id);
    }
  }, [product]);

  const fetchExistingPrices = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscription_prices')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;

      if (data && data.length > 0) {
        setPrices(data.map(price => ({
          id: price.id,
          currency: price.currency,
          unit_amount: price.unit_amount.toString(),
          interval: price.interval,
          interval_count: price.interval_count.toString(),
          nickname: price.nickname || '',
          active: price.active,
        })));
      }
    } catch (error: any) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create or update product
      let productId = product?.id;
      
      if (product) {
        const { error } = await supabase
          .from('subscription_products')
          .update({
            name: formData.name,
            description: formData.description || null,
            image_url: formData.image_url || null,
            active: formData.active,
          })
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('subscription_products')
          .insert({
            name: formData.name,
            description: formData.description || null,
            image_url: formData.image_url || null,
            active: formData.active,
          })
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Handle prices
      console.log('Processing prices:', prices);
      for (const price of prices) {
        console.log('Processing price:', price, 'unit_amount:', price.unit_amount, 'parsed:', parseInt(price.unit_amount || '0'));
        if (price.unit_amount && parseInt(price.unit_amount) > 0) {
          const priceData = {
            product_id: productId,
            currency: price.currency,
            unit_amount: parseInt(price.unit_amount),
            interval: price.interval,
            interval_count: parseInt(price.interval_count),
            nickname: price.nickname || null,
            active: price.active,
          };

          console.log('Saving price data:', priceData);

          if (price.id) {
            // Update existing price
            console.log('Updating existing price with id:', price.id);
            const { error } = await supabase
              .from('subscription_prices')
              .update(priceData)
              .eq('id', price.id);

            if (error) {
              console.error('Error updating price:', error);
              throw error;
            }
            console.log('Price updated successfully');
          } else {
            // Create new price
            console.log('Creating new price');
            const { error } = await supabase
              .from('subscription_prices')
              .insert(priceData);

            if (error) {
              console.error('Error creating price:', error);
              throw error;
            }
            console.log('Price created successfully');
          }
        } else {
          console.log('Skipping price due to invalid unit_amount:', price.unit_amount);
        }
      }

      toast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPrice = () => {
    setPrices([...prices, {
      currency: 'usd',
      unit_amount: '',
      interval: 'month',
      interval_count: '1',
      nickname: '',
      active: true,
    }]);
  };

  const removePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const updatePrice = (index: number, field: keyof PriceData, value: any) => {
    const updatedPrices = [...prices];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    
    // Automatically set interval_count to '1' when interval is 'once'
    if (field === 'interval' && value === 'once') {
      updatedPrices[index].interval_count = '1';
    }
    
    setPrices(updatedPrices);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {product ? 'Edit Product' : 'Create New Product'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Subscription"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your subscription product..."
                rows={3}
              />
            </div>

            <SubscriptionImageUpload
              imageUrl={formData.image_url}
              onImageChange={(url) => setFormData({ ...formData, image_url: url })}
              disabled={loading}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <Separator />

          {/* Pricing Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Pricing Plans</h3>
              <Button type="button" variant="outline" onClick={addPrice}>
                <Plus className="w-4 h-4 mr-2" />
                Add Price
              </Button>
            </div>

            {prices.map((price, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={price.currency}
                      onValueChange={(value) => updatePrice(index, 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="bwp">BWP (P)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (cents)</Label>
                    <Input
                      type="number"
                      value={price.unit_amount}
                      onChange={(e) => updatePrice(index, 'unit_amount', e.target.value)}
                      placeholder="1500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Interval</Label>
                    <Select
                      value={price.interval}
                      onValueChange={(value) => updatePrice(index, 'interval', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="once">Once (One-time payment)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                   <div className="space-y-2">
                     <Label>Every</Label>
                     <Input
                       type="number"
                       min="1"
                       value={price.interval_count}
                       onChange={(e) => updatePrice(index, 'interval_count', e.target.value)}
                       disabled={price.interval === 'once'}
                     />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Nickname (optional)</Label>
                    <Input
                      value={price.nickname}
                      onChange={(e) => updatePrice(index, 'nickname', e.target.value)}
                      placeholder="e.g., Basic Plan"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={price.active}
                        onCheckedChange={(checked) => updatePrice(index, 'active', checked)}
                      />
                      <Label>Active</Label>
                    </div>
                    {prices.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePrice(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubscriptionProductForm;