
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EndpointEmptyStateProps {
  onCreateClick: () => void;
}

export const EndpointEmptyState = ({ onCreateClick }: EndpointEmptyStateProps) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <h3 className="text-lg font-medium mb-2">No endpoints configured yet</h3>
      <p className="text-muted-foreground mb-6">
        Add your first endpoint to connect with external services
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Endpoint
      </Button>
    </div>
  );
};
