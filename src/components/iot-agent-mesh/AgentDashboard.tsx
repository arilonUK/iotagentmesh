import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Cpu,
  Network,
  HardDrive
} from 'lucide-react';
import { agentManagementService, AgentWithHealth } from '@/services/api/agentManagementService';
import { toast } from 'sonner';

interface AgentDashboardProps {
  className?: string;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ className }) => {
  const [agents, setAgents] = useState<AgentWithHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentWithHealth | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentData = await agentManagementService.getAllAgents();
      setAgents(agentData);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAgents();
    setRefreshing(false);
    toast.success('Agents refreshed');
  };

  const handleRestartAgent = async (agentId: string) => {
    try {
      await agentManagementService.restartAgent(agentId);
      await loadAgents(); // Refresh the list
    } catch (error) {
      console.error('Error restarting agent:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-green-500';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const healthStats = {
    online: agents.filter(a => a.status === 'online').length,
    offline: agents.filter(a => a.status === 'offline').length,
    error: agents.filter(a => a.status === 'error').length,
    total: agents.length
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">IoT Agent Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage your IoT agents</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{healthStats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{healthStats.online}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{healthStats.offline}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-orange-600">{healthStats.error}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(agent.status)}
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.type} • {agent.endpoint}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge className={getHealthBadgeColor(agent.health_score)}>
                            Health: {agent.health_score}%
                          </Badge>
                          <Badge variant="outline" className={getConnectionQualityColor(agent.connection_quality)}>
                            {agent.connection_quality}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {agent.devices_count} devices • {agent.uptime_percentage.toFixed(1)}% uptime
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestartAgent(agent.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Agent capabilities */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedAgent ? (
            <Card>
              <CardHeader>
                <CardTitle>Agent Details: {selectedAgent.name}</CardTitle>
                <CardDescription>Detailed information and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Basic Information</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                        <dd className="text-sm">{selectedAgent.id}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                        <dd className="text-sm">{selectedAgent.type}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Version</dt>
                        <dd className="text-sm">{selectedAgent.version}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Endpoint</dt>
                        <dd className="text-sm">{selectedAgent.endpoint}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Health & Performance</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Health Score</dt>
                        <dd className="text-sm">{selectedAgent.health_score}%</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Connection Quality</dt>
                        <dd className="text-sm capitalize">{selectedAgent.connection_quality}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Uptime</dt>
                        <dd className="text-sm">{selectedAgent.uptime_percentage.toFixed(1)}%</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Last Seen</dt>
                        <dd className="text-sm">{new Date(selectedAgent.last_seen).toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an agent to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">45.2%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average across all agents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Network Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">127ms</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Storage Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">67.8%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Combined storage usage</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};