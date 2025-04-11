
import { useState } from 'react';
import { EndpointConfig } from '@/types/endpoint';
import { EndpointCard } from './EndpointCard';
import { EndpointDeleteDialog } from './EndpointDeleteDialog';
import { EndpointEmptyState } from './EndpointEmptyState';
import { EndpointLoading } from './EndpointLoading';

interface EndpointListProps {
  endpoints: EndpointConfig[];
  isLoading: boolean;
  onEdit: (endpoint: EndpointConfig) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onTrigger: (id: string) => void;
}

export default function EndpointList({
  endpoints,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  onTrigger
}: EndpointListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return <EndpointLoading />;
  }

  if (!endpoints.length) {
    return <EndpointEmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {endpoints.map((endpoint) => (
          <EndpointCard
            key={endpoint.id}
            endpoint={endpoint}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            onToggle={onToggle}
            onTrigger={onTrigger}
          />
        ))}
      </div>

      <EndpointDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
      />
    </>
  );
}
