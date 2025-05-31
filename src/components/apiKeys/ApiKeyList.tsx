
import { useState } from 'react';
import { format } from 'date-fns';
import { Key, Trash2, Edit3 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDeleteKey: (id: string) => void;
  onToggleKey: (id: string, active: boolean) => void;
  onEditKey?: (key: ApiKey) => void;
}

export const ApiKeyList = ({ apiKeys, onDeleteKey, onToggleKey, onEditKey }: ApiKeyListProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, active: boolean) => {
    setLoading(id);
    try {
      await onToggleKey(id, active);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(id);
    try {
      await onDeleteKey(id);
    } finally {
      setLoading(null);
    }
  };

  const getExpirationBadge = (expiresAt: string | null) => {
    if (!expiresAt) return <Badge variant="secondary">Never expires</Badge>;
    
    const expDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge variant="destructive">Expires in {daysUntilExpiry} days</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary">Expires in {daysUntilExpiry} days</Badge>;
    } else {
      return <Badge variant="outline">Expires {format(expDate, 'MMM d, yyyy')}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Scopes</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Expiration</TableHead>
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
                    <Badge key={scope} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(key.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {getExpirationBadge(key.expires_at)}
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
                  onCheckedChange={(checked) => handleToggle(key.id, checked)}
                  disabled={loading === key.id}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  {onEditKey && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditKey(key)}
                      disabled={loading === key.id}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(key.id)}
                    disabled={loading === key.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
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
