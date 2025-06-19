import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import BannerForm from "./BannerForm";
import BannersTable from "./BannersTable";

const BannerManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Banner Management</CardTitle>
              <CardDescription>
                Manage advertising banners displayed on your site
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <BannerForm
              banner={editingBanner}
              onClose={handleCloseForm}
              onSuccess={handleCloseForm}
            />
          ) : (
            <BannersTable onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerManagement;