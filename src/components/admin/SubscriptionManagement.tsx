import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import SubscriptionProductTable from './SubscriptionProductTable';
import SubscriptionProductForm from './SubscriptionProductForm';

interface SubscriptionProduct {
  id: string;
  name: string;
  description: string | null;
  stripe_product_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const SubscriptionManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SubscriptionProduct | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (product: SubscriptionProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Subscription Products
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your subscription products and pricing plans
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SubscriptionProductTable key={refreshKey} onEdit={handleEdit} />
        </CardContent>
      </Card>

      {showForm && (
        <SubscriptionProductForm
          product={editingProduct}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default SubscriptionManagement;