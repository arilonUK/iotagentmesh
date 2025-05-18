
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface ApiKeyCreatedCardProps {
  apiKey: string;
  onDismiss: () => void;
}

export const ApiKeyCreatedCard = ({ apiKey, onDismiss }: ApiKeyCreatedCardProps) => {
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  return (
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
            value={apiKey} 
            readOnly 
            className="font-mono bg-background"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCopyKey}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={onDismiss}
        >
          I've copied my key
        </Button>
      </CardFooter>
    </Card>
  );
};
