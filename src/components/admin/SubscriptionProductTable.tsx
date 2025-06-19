import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, DollarSign, ExternalLink, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface SubscriptionPrice {
  id: string;
  product_id: string;
  stripe_price_id: string | null;
  currency: string;
  unit_amount: number;
  interval: string;
  interval_count: number;
  nickname: string | null;
  active: boolean;
}

interface SubscriptionProductTableProps {
  onEdit: (product: SubscriptionProduct) => void;
}

const SubscriptionProductTable = ({ onEdit }: SubscriptionProductTableProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [prices, setPrices] = useState<SubscriptionPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchPrices();
  }, []);

  const fetchProducts = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('subscription_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
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

  const fetchPrices = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('subscription_prices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrices(data || []);
    } catch (error: any) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all associated prices.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subscription_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSyncWithStripe = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-stripe-product', {
        body: { productId },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product synced with Stripe successfully",
      });

      fetchProducts();
      fetchPrices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sync with Stripe",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getProductPrices = (productId: string) => {
    return prices.filter(price => price.product_id === productId && price.active);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Prices</TableHead>
            <TableHead>Stripe ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No subscription products found. Create your first product to get started.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const productPrices = getProductPrices(product.id);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Created {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-16 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-muted rounded border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {product.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {productPrices.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No prices</span>
                      ) : (
                        productPrices.map((price) => (
                           <div key={price.id} className="text-sm">
                             {formatPrice(price.unit_amount, price.currency)}{price.interval !== 'once' ? `/${price.interval}` : ''}
                             {price.nickname && (
                               <span className="text-muted-foreground ml-1">
                                 ({price.nickname})
                               </span>
                             )}
                           </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.stripe_product_id ? (
                      <div className="flex items-center space-x-1">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {product.stripe_product_id.substring(0, 12)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://dashboard.stripe.com/products/${product.stripe_product_id}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not synced</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSyncWithStripe(product.id)}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Sync with Stripe
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubscriptionProductTable;