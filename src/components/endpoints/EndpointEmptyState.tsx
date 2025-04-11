
import { AlertCircle } from 'lucide-react';

export const EndpointEmptyState = () => {
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/10">
      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">No endpoints found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating your first endpoint.
      </p>
    </div>
  );
};
