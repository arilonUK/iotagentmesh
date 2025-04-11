
import React from 'react';
import { DataBucketConfig } from '@/types/dataBucket';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Edit, 
  Trash2, 
  Database, 
  Cloud, 
  AlertCircle, 
  Check 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataBucketListProps {
  buckets: DataBucketConfig[];
  onEdit: (bucket: DataBucketConfig) => void;
  onDelete: (bucketId: string) => void;
  isDeleting: boolean;
}

const DataBucketList: React.FC<DataBucketListProps> = ({
  buckets,
  onEdit,
  onDelete,
  isDeleting
}) => {
  if (buckets.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No data buckets found</h3>
        <p className="text-muted-foreground mt-1">
          Create your first data bucket to start collecting device data
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Storage</TableHead>
            <TableHead>Reading Type</TableHead>
            <TableHead>Retention</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map((bucket) => (
            <TableRow key={bucket.id}>
              <TableCell className="font-medium">{bucket.name}</TableCell>
              <TableCell>
                {bucket.storageBackend === 'postgres' ? (
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-1" />
                    <span>PostgreSQL</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Cloud className="h-4 w-4 mr-1" />
                    <span>S3</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{bucket.readingType}</TableCell>
              <TableCell>{bucket.retentionDays} days</TableCell>
              <TableCell>
                {bucket.enabled ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    Disabled
                  </span>
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(bucket.updatedAt), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(bucket)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(bucket.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataBucketList;
