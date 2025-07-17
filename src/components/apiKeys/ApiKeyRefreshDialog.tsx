
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApiKey } from '@/types/apiKey';

interface ApiKeyRefreshDialogProps {
  apiKey: ApiKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: (id: string) => Promise<string>;
  isLoading: boolean;
}

export const ApiKeyRefreshDialog = ({ 
  apiKey, 
  open, 
  onOpenChange, 
  onRefresh,
  isLoading 
}: ApiKeyRefreshDialogProps) => {
  const [newKey, setNewKey] = useState<string>('');
  const [showNewKey, setShowNewKey] = useState(false);

  const handleRefresh = async () => {
    if (!apiKey) return;
    
    try {
      console.log('Starting refresh for API key:', apiKey.id);
      const refreshedKey = await onRefresh(apiKey.id);
      console.log('Received refreshed key:', refreshedKey);
      setNewKey(refreshedKey);
      setShowNewKey(true);
      console.log('Updated dialog state - showNewKey:', true, 'newKey length:', refreshedKey.length);
      toast.success('API key refreshed successfully');
    } catch (error) {
      console.error('Error refreshing API key:', error);
      toast.error('Failed to refresh API key');
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(newKey);
    toast.success('New API key copied to clipboard');
  };

  const handleClose = () => {
    setShowNewKey(false);
    setNewKey('');
    onOpenChange(false);
  };

  if (!apiKey) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refresh API Key</DialogTitle>
          <DialogDescription>
            {!showNewKey ? (
              <>
                This will generate a new API key for "{apiKey.name}". The old key will be 
                immediately invalidated and you'll need to update any applications using it.
              </>
            ) : (
              'Your new API key has been generated. This is the only time you\'ll see the full key.'
            )}
          </DialogDescription>
        </DialogHeader>
        
        {showNewKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">New API Key:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded text-sm font-mono break-all">
                  {newKey}
                </code>
                <Button size="sm" onClick={handleCopyKey}>
                  Copy
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Make sure to copy and store this key securely. You won't be able to see it again.
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <RefreshCw className="h-4 w-4" />
              Current key: <code className="font-mono">{apiKey.prefix}</code>
            </div>
            <p className="text-sm">
              Expires: {apiKey.expires_at 
                ? new Date(apiKey.expires_at).toLocaleDateString() 
                : 'Never'
              }
            </p>
          </div>
        )}
        
        <DialogFooter>
          {!showNewKey ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh Key'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
