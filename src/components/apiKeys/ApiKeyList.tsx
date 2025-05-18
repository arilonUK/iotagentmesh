
import { useState } from 'react';
import { format } from 'date-fns';
import { Key, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiKey } from '@/types/apiKey';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDeleteKey: (id: string) => void;
  onToggleKey: (id: string, active: boolean) => void;
}

export const ApiKeyList = ({ apiKeys, onDeleteKey, onToggleKey }: ApiKeyListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Scopes</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {apiKeys.length > 0 ? (
          apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Key className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-sm">{key.prefix}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {key.scopes.map(scope => (
                    <span key={scope} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {scope}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(key.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {key.expires_at 
                  ? format(new Date(key.expires_at), 'MMM d, yyyy')
                  : 'Never'
                }
              </TableCell>
              <TableCell>
                {key.last_used
                  ? format(new Date(key.last_used), 'MMM d, yyyy')
                  : 'Never used'
                }
              </TableCell>
              <TableCell>
                <Switch
                  checked={key.is_active}
                  onCheckedChange={(checked) => onToggleKey(key.id, checked)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteKey(key.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
              No API keys found. Create your first key to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
