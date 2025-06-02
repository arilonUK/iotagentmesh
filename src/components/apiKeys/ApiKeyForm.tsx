
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { NewApiKeyFormData, ApiKeyScope } from '@/types/apiKey';

const AVAILABLE_SCOPES: ApiKeyScope[] = ['read', 'write', 'devices', 'users', 'analytics'];

interface ApiKeyFormProps {
  onCreateKey: (data: NewApiKeyFormData) => void;
}

export const ApiKeyForm = ({ onCreateKey }: ApiKeyFormProps) => {
  const { organization } = useAuth();
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);
  const [expiration, setExpiration] = useState<string>('never');
  const [open, setOpen] = useState(false);

  console.log('ApiKeyForm - organization:', organization);

  const handleSubmit = () => {
    if (!organization?.id) {
      console.error('Cannot create API key: no organization available');
      return;
    }

    console.log('Submitting API key creation with:', {
      name,
      scopes,
      expiration,
      organizationId: organization.id
    });

    onCreateKey({
      name,
      scopes,
      expiration
    });
    
    // Reset form and close dialog
    setName('');
    setScopes(['read']);
    setExpiration('never');
    setOpen(false);
  };

  // Disable the button if no organization is available
  const isDisabled = !organization?.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isDisabled}>
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
        
        {!organization?.id ? (
          <div className="py-4">
            <p className="text-destructive text-sm">
              No organization available. Please check your organization settings before creating API keys.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Development Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Access Scopes</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SCOPES.map(scope => (
                  <Button 
                    key={scope} 
                    variant={scopes.includes(scope) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (scopes.includes(scope)) {
                        setScopes(scopes.filter(s => s !== scope));
                      } else {
                        setScopes([...scopes, scope]);
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
                value={expiration} 
                onValueChange={setExpiration}
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
        )}
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={!name || scopes.length === 0 || !organization?.id}
          >
            Create Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
