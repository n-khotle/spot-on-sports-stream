import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  click_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface BannerTableProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onRefresh: () => void;
}

const BannerTable = ({ banners, onEdit, onRefresh }: BannerTableProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (bannerId: string) => {
    setIsLoading(bannerId);
    
    try {
      const { error } = await supabase
        .from("ad_banners")
        .delete()
        .eq("id", bannerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete banner",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleToggleActive = async (bannerId: string, currentStatus: boolean) => {
    setIsLoading(bannerId);
    
    try {
      const { error } = await supabase
        .from("ad_banners")
        .update({ is_active: !currentStatus })
        .eq("id", bannerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banner ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update banner",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (banners.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No banners found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Click URL</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell>
                <div className="w-20 h-10 overflow-hidden rounded border">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{banner.title}</TableCell>
              <TableCell>
                {banner.click_url ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground truncate max-w-32">
                      {banner.click_url}
                    </span>
                    <a
                      href={banner.click_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>{banner.display_order}</TableCell>
              <TableCell>
                <Switch
                  checked={banner.is_active}
                  onCheckedChange={() => handleToggleActive(banner.id, banner.is_active)}
                  disabled={isLoading === banner.id}
                />
              </TableCell>
              <TableCell>
                {new Date(banner.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(banner)}
                    disabled={isLoading === banner.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading === banner.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{banner.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(banner.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BannerTable;