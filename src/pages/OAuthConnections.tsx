import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowRight, 
  CircleCheckBig, 
  History, 
  Link2, 
  Link2Off, 
  Plus,
  RefreshCw, 
  Trash2 
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface OAuthConnection {
  id: string;
  provider: string;
  name: string;
  connected_at: string;
  last_used: string | null;
  status: 'active' | 'expired' | 'revoked';
  scopes: string[];
}

interface OAuthProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  available_scopes: { id: string; name: string; description: string }[];
}

export default function OAuthConnections() {
  const { profile } = useAuth();
  const [connections, setConnections] = useState<OAuthConnection[]>([
    {
      id: '1',
      provider: 'google',
      name: 'Google Calendar',
      connected_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      status: 'active',
      scopes: ['calendar.read', 'calendar.events']
    },
    {
      id: '2',
      provider: 'spotify',
      name: 'Spotify',
      connected_at: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
      last_used: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      status: 'active',
      scopes: ['user-read-playback-state', 'user-modify-playback-state']
    },
    {
      id: '3',
      provider: 'github',
      name: 'GitHub',
      connected_at: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString(),
      last_used: null,
      status: 'expired',
      scopes: ['repo']
    }
  ]);
  
  const [providers, setProviders] = useState<OAuthProvider[]>([
    {
      id: 'google',
      name: 'Google',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
      description: 'Connect to Google services like Calendar, Drive, and more',
      available_scopes: [
        { id: 'calendar.read', name: 'Calendar Read', description: 'View your calendars and events' },
        { id: 'calendar.events', name: 'Calendar Events', description: 'Create and modify calendar events' },
        { id: 'drive.read', name: 'Drive Read', description: 'View your Google Drive files' }
      ]
    },
    {
      id: 'spotify',
      name: 'Spotify',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png',
      description: 'Control Spotify playback and access your playlists',
      available_scopes: [
        { id: 'user-read-playback-state', name: 'Read Playback', description: 'Read your playback state' },
        { id: 'user-modify-playback-state', name: 'Modify Playback', description: 'Control your playback' },
        { id: 'playlist-read-private', name: 'Read Playlists', description: 'Access your playlists' }
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      description: 'Access GitHub repositories and issues',
      available_scopes: [
        { id: 'repo', name: 'Repositories', description: 'Full access to repositories' },
        { id: 'user', name: 'User', description: 'Read user profile data' }
      ]
    },
    {
      id: 'twitter',
      name: 'Twitter',
      logo: 'https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png',
      description: 'Post tweets and read your timeline',
      available_scopes: [
        { id: 'tweet.read', name: 'Read Tweets', description: 'Read your timeline' },
        { id: 'tweet.write', name: 'Write Tweets', description: 'Post tweets on your behalf' }
      ]
    }
  ]);
  
  const [selectedProvider, setSelectedProvider] = useState<OAuthProvider | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  
  const handleConnect = (provider: OAuthProvider) => {
    setSelectedProvider(provider);
    setSelectedScopes([provider.available_scopes[0]?.id].filter(Boolean));
  };
  
  const handleAuthorize = () => {
    // In a real app, we would redirect to the OAuth provider
    toast.success(`Redirecting to ${selectedProvider?.name} for authorization`);
    
    // Simulate a successful connection after a brief delay
    setTimeout(() => {
      if (selectedProvider) {
        const newConnection: OAuthConnection = {
          id: Math.random().toString(),
          provider: selectedProvider.id,
          name: selectedProvider.name,
          connected_at: new Date().toISOString(),
          last_used: null,
          status: 'active',
          scopes: selectedScopes
        };
        
        setConnections([...connections, newConnection]);
        setSelectedProvider(null);
        setSelectedScopes([]);
        
        toast.success(`Successfully connected to ${selectedProvider.name}`);
      }
    }, 1000);
  };
  
  const handleRefreshToken = (id: string) => {
    // In a real app, we would call an API to refresh the token
    toast.success('OAuth token refreshed successfully');
    
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, status: 'active' as const } : conn
    ));
  };
  
  const handleRevokeAccess = (id: string) => {
    // In a real app, we would call an API to revoke the token
    setConnections(connections.filter(conn => conn.id !== id));
    toast.success('Connection revoked successfully');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">OAuth Connections</h1>
          <p className="text-muted-foreground">
            Connect your platform to external services using OAuth
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Connect to a Service</DialogTitle>
              <DialogDescription>
                Choose a service to connect with your IoT platform
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              {providers.map((provider) => (
                <Card 
                  key={provider.id} 
                  className={`cursor-pointer transition-all ${
                    connections.some(c => c.provider === provider.id && c.status === 'active')
                      ? 'border-primary/30 bg-primary/5'
                      : 'hover:border-primary/30 hover:bg-primary/5'
                  }`}
                  onClick={() => handleConnect(provider)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="h-12 w-12 mb-3 relative">
                      <img
                        src={provider.logo}
                        alt={provider.name}
                        className="h-full w-full object-contain"
                      />
                      {connections.some(c => c.provider === provider.id && c.status === 'active') && (
                        <div className="absolute -right-1 -bottom-1 bg-primary text-primary-foreground rounded-full p-0.5">
                          <CircleCheckBig className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {connections.some(c => c.provider === provider.id && c.status === 'active')
                        ? 'Connected'
                        : 'Not connected'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedProvider && (
        <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect to {selectedProvider.name}</DialogTitle>
              <DialogDescription>
                {selectedProvider.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <h4 className="font-medium">Select permissions:</h4>
              <div className="space-y-2">
                {selectedProvider.available_scopes.map((scope) => (
                  <div 
                    key={scope.id} 
                    className="flex items-start gap-2 rounded-md border p-3 transition-colors hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      id={scope.id}
                      className="mt-1"
                      checked={selectedScopes.includes(scope.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScopes([...selectedScopes, scope.id]);
                        } else {
                          setSelectedScopes(selectedScopes.filter(s => s !== scope.id));
                        }
                      }}
                    />
                    <div>
                      <label htmlFor={scope.id} className="font-medium cursor-pointer">
                        {scope.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {scope.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedProvider(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAuthorize}
                disabled={selectedScopes.length === 0}
              >
                Authorize <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
          <CardDescription>
            View and manage your OAuth service connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connected</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.length > 0 ? (
                connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img
                          src={providers.find(p => p.id === connection.provider)?.logo}
                          alt={connection.name}
                          className="h-5 w-5 object-contain"
                        />
                        {connection.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          connection.status === 'active' 
                            ? 'default' 
                            : connection.status === 'expired'
                              ? 'destructive'
                              : 'outline'
                        }
                      >
                        {connection.status === 'active' 
                          ? 'Active' 
                          : connection.status === 'expired'
                            ? 'Expired'
                            : 'Revoked'
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <History className="h-3 w-3 text-muted-foreground" />
                        {formatDistanceToNow(new Date(connection.connected_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {connection.last_used
                        ? formatDistanceToNow(new Date(connection.last_used), { addSuffix: true })
                        : 'Never used'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {connection.scopes.map(scope => {
                          const scopeDetail = providers
                            .find(p => p.id === connection.provider)
                            ?.available_scopes
                            .find(s => s.id === scope);
                          
                          return (
                            <span 
                              key={scope} 
                              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                              title={scopeDetail?.description}
                            >
                              {scopeDetail?.name || scope}
                            </span>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {connection.status === 'expired' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefreshToken(connection.id)}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Refresh
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                            >
                              <Link2Off className="h-3.5 w-3.5 mr-1" />
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to disconnect from {connection.name}? 
                                This will revoke all access and any integrations using this connection will stop working.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeAccess(connection.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Yes, revoke access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No connections found. Connect to a service to get started.
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
