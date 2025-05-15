
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, Copy, Key, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_at: string;
  expires_at: string | null;
  last_used: string | null;
  is_active: boolean;
}

export default function ApiKeyManagement() {
  const { profile } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Development Key',
      prefix: 'dev_key_xxxx',
      scopes: ['read', 'write'],
      created_at: new Date().toISOString(),
      expires_at: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      last_used: new Date().toISOString(),
      is_active: true
    },
    {
      id: '2',
      name: 'Testing Key',
      prefix: 'test_key_xxxx',
      scopes: ['read'],
      created_at: new Date().toISOString(),
      expires_at: null,
      last_used: null,
      is_active: true
    }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['read']);
  const [newKeyExpiration, setNewKeyExpiration] = useState<string>('never');
  const [showNewKey, setShowNewKey] = useState('');
  
  const handleCreateKey = () => {
    // In a real app, we would call an API to create the key and get back the full key
    const newKey = `${profile?.default_organization_id.substring(0, 8)}_${Math.random().toString(36).substring(2, 10)}`;
    const prefix = `${newKey.substring(0, 8)}...`;
    
    const newApiKey: ApiKey = {
      id: Math.random().toString(),
      name: newKeyName,
      prefix,
      scopes: newKeyScopes,
      created_at: new Date().toISOString(),
      expires_at: newKeyExpiration === 'never' ? null : 
        new Date(new Date().setMonth(new Date().getMonth() + parseInt(newKeyExpiration))).toISOString(),
      last_used: null,
      is_active: true
    };
    
    setApiKeys([...apiKeys, newApiKey]);
    setShowNewKey(newKey);
    setNewKeyName('');
    setNewKeyScopes(['read']);
    setNewKeyExpiration('never');
    
    toast.success('API key created successfully');
  };
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };
  
  const handleToggleKey = (id: string, active: boolean) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, is_active: active } : key
    ));
    
    toast.success(`API key ${active ? 'activated' : 'deactivated'}`);
  };
  
  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast.success('API key deleted');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">API Key Management</h1>
          <p className="text-muted-foreground">
            Create and manage API keys for programmatic access to your IoT platform
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for secure access to the platform. 
                You'll only be able to see the full key once when it's created.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Development Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Access Scopes</Label>
                <div className="flex flex-wrap gap-2">
                  {['read', 'write', 'devices', 'users', 'analytics'].map(scope => (
                    <Button 
                      key={scope} 
                      variant={newKeyScopes.includes(scope) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (newKeyScopes.includes(scope)) {
                          setNewKeyScopes(newKeyScopes.filter(s => s !== scope));
                        } else {
                          setNewKeyScopes([...newKeyScopes, scope]);
                        }
                      }}
                    >
                      {scope}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="expiration">Expiration</Label>
                <Select 
                  value={newKeyExpiration} 
                  onValueChange={setNewKeyExpiration}
                >
                  <SelectTrigger id="expiration">
                    <SelectValue placeholder="Select expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleCreateKey} 
                disabled={!newKeyName || newKeyScopes.length === 0}
              >
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {showNewKey && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">API Key Created</CardTitle>
            <CardDescription>
              This is the only time we'll show the full key. Please copy it now and store it securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input 
                value={showNewKey} 
                readOnly 
                className="font-mono bg-background"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleCopyKey(showNewKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewKey('')}
            >
              I've copied my key
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        onCheckedChange={(checked) => handleToggleKey(key.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKey(key.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
