import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone_number: string | null;
  created_at: string;
  allocated_subscription_products: string[] | null;
}

interface SubscriptionProduct {
  id: string;
  name: string;
}

interface UserFormProps {
  editingUser: User | null;
  onUserSaved: () => void;
  onCancel: () => void;
}

const UserForm = ({ editingUser, onUserSaved, onCancel }: UserFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionProducts, setSubscriptionProducts] = useState<SubscriptionProduct[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user',
    phone_number: '',
    allocated_subscription_products: [] as string[],
  });

  useEffect(() => {
    fetchSubscriptionProducts();
  }, []);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        full_name: editingUser.full_name || '',
        email: editingUser.email,
        role: editingUser.role,
        phone_number: editingUser.phone_number || '',
        allocated_subscription_products: editingUser.allocated_subscription_products || [],
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        role: 'user',
        phone_number: '',
        allocated_subscription_products: [],
      });
    }
  }, [editingUser]);

  const fetchSubscriptionProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_products')
        .select('id, name')
        .eq('active', true);

      if (error) throw error;
      setSubscriptionProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching subscription products:', error);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) {
      toast({
        title: "Error",
        description: "No user selected for editing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Updating user with allocated products:', {
        userId: editingUser.id,
        allocatedProducts: formData.allocated_subscription_products
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          role: formData.role,
          phone_number: formData.phone_number || null,
          allocated_subscription_products: formData.allocated_subscription_products,
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('User updated successfully');
      toast({
        title: "Success",
        description: "User updated successfully",
      });

      // Force a small delay to ensure DB is updated
      setTimeout(() => {
        onUserSaved();
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: '',
      email: '',
      role: 'user',
      phone_number: '',
      allocated_subscription_products: [],
    });
    onCancel();
  };

  const handleProductToggle = (productId: string, checked: boolean) => {
    const currentProducts = formData.allocated_subscription_products;
    if (checked) {
      // Add product if not already included
      if (!currentProducts.includes(productId)) {
        handleInputChange('allocated_subscription_products', [...currentProducts, productId]);
      }
    } else {
      // Remove product
      handleInputChange('allocated_subscription_products', currentProducts.filter(id => id !== productId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingUser ? 'Edit User' : 'User Management'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!editingUser ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a user to edit their details
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
                placeholder="Email cannot be changed"
              />
              <p className="text-sm text-muted-foreground">
                Email addresses cannot be modified
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label>Allocated Subscription Products</Label>
              <div className="space-y-2">
                {subscriptionProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subscription products available</p>
                ) : (
                  subscriptionProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={formData.allocated_subscription_products.includes(product.id)}
                        onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                      />
                      <Label htmlFor={`product-${product.id}`} className="text-sm font-normal">
                        {product.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
              
              {formData.allocated_subscription_products.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Currently allocated:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.allocated_subscription_products.map((productId) => {
                      const product = subscriptionProducts.find(p => p.id === productId);
                      return product ? (
                        <Badge key={productId} variant="outline" className="text-xs">
                          {product.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default UserForm;