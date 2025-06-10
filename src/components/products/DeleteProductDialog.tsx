
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { productServices } from "@/services/products";
import { useToast } from "@/hooks/use-toast";

export type DeleteProductDialogProps = {
  productId: string;
  productName: string;
  onDelete: () => void;
};

export function DeleteProductDialog({ productId, productName, onDelete }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await productServices.deleteProduct(productId);
      toast({
        title: "Product deleted",
        description: `${productName} has been successfully deleted.`,
      });
      setOpen(false);
      onDelete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: error.message || "An error occurred while deleting the product.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [productId, productName, toast, onDelete]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-destructive/10 hover:text-destructive"
          title="Delete product"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{productName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
