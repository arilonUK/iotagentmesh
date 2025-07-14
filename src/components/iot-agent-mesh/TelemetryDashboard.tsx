import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  TrendingUp, 
  Clock, 
  Wifi, 
  RefreshCw,
  Download,
  Upload,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { telemetryDataService, TelemetryEntry, TelemetryMetrics } from '@/services/api/telemetryDataService';
import { integratedDeviceService } from '@/services/api/integratedDeviceService';
import { toast } from 'sonner';

interface TelemetryDashboardProps {
  className?: string;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ className }) => {
  const [telemetryData, setTelemetryData] = useState<TelemetryEntry[]>([]);
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTelemetryData();
  }, [selectedDevice, selectedMetric, timeRange]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [telemetryMetrics, deviceList] = await Promise.all([
        telemetryDataService.getTelemetryMetrics(),
        integratedDeviceService.fetchAll()
      ]);
      
      setMetrics(telemetryMetrics);
      setDevices(deviceList);
      await loadTelemetryData();
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  };

  const loadTelemetryData = async () => {
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - getTimeRangeMs(timeRange)).toISOString();

      const options = {
        device_id: selectedDevice !== 'all' ? selectedDevice : undefined,
        reading_type: selectedMetric !== 'all' ? selectedMetric : undefined,
        start_time: startTime,
        end_time: endTime,
        limit: 1000
      };

      const data = await telemetryDataService.getTelemetryData(options);
      setTelemetryData(data);
    } catch (error) {
      console.error('Error loading telemetry data:', error);
      toast.error('Failed to load telemetry data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
    toast.success('Telemetry data refreshed');
  };

  const handleSyncToMesh = async (deviceId: string) => {
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - getTimeRangeMs('24h')).toISOString();
      
      await telemetryDataService.syncTelemetryToMesh(deviceId, startTime, endTime);
      await loadTelemetryData();
    } catch (error) {
      console.error('Error syncing to mesh:', error);
    }
  };

  const getTimeRangeMs = (range: string): number => {
    switch (range) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'bad':
        return 'bg-red-100 text-red-800';
      case 'uncertain':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'bad':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uncertain':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const uniqueMetrics = [...new Set(telemetryData.map(d => d.reading_type))];

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
          <h2 className="text-2xl font-semibold">Telemetry Dashboard</h2>
          <p className="text-muted-foreground">Monitor device data collection and transmission</p>
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
            <Upload className="h-4 w-4 mr-2" />
            Upload Data
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Readings</p>
                  <p className="text-2xl font-bold">{metrics.total_readings.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Devices</p>
                  <p className="text-2xl font-bold">{metrics.unique_devices}</p>
                </div>
                <Wifi className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Data</p>
                  <p className="text-2xl font-bold">{metrics.data_points_today.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Frequency</p>
                  <p className="text-2xl font-bold">{metrics.average_frequency.toFixed(1)}/day</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Device:</label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Metric:</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  {uniqueMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Range:</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="6h">6 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="readings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="readings">Latest Readings</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="readings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Telemetry Readings</CardTitle>
              <CardDescription>
                Recent data points from your IoT devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {telemetryData.slice(0, 20).map((reading) => {
                  const device = devices.find(d => d.id === reading.device_id);
                  return (
                    <div key={reading.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getQualityIcon(reading.quality || 'good')}
                        <div>
                          <h4 className="font-medium">{device?.name || reading.device_id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {reading.reading_type} • {new Date(reading.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-mono text-lg">
                            {reading.value} {reading.unit && <span className="text-sm text-muted-foreground">{reading.unit}</span>}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getQualityBadgeColor(reading.quality || 'good')}>
                              {reading.quality || 'good'}
                            </Badge>
                            {reading.mesh_synced && (
                              <Badge variant="outline" className="text-green-600">
                                Synced
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Good Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold">{metrics.quality_distribution.good.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((metrics.quality_distribution.good / metrics.total_readings) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Uncertain Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-2xl font-bold">{metrics.quality_distribution.uncertain.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((metrics.quality_distribution.uncertain / metrics.total_readings) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Poor Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-2xl font-bold">{metrics.quality_distribution.bad.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((metrics.quality_distribution.bad / metrics.total_readings) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mesh Synchronization Status</CardTitle>
              <CardDescription>
                Monitor data synchronization with IoT Agent Mesh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.filter(d => d.telemetry_enabled).map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${device.sync_status === 'synced' ? 'bg-green-500' : device.sync_status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <div>
                        <h4 className="font-medium">{device.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last sync: {device.last_sync_at ? new Date(device.last_sync_at).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge variant={device.sync_status === 'synced' ? 'default' : 'destructive'}>
                        {device.sync_status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncToMesh(device.id)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};