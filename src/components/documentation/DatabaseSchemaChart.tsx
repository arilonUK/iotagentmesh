
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Database, Key, Link, Eye, EyeOff } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
}

interface Table {
  name: string;
  columns: Column[];
  description?: string;
}

const DatabaseSchemaChart = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showRelationships, setShowRelationships] = useState(true);

  const tables: Table[] = [
    {
      name: 'organizations',
      description: 'Core organization entities',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'name', type: 'text', nullable: false, default: null },
        { name: 'slug', type: 'text', nullable: false, default: null },
        { name: 'subscription_plan_id', type: 'uuid', nullable: true, default: null, isForeignKey: true, references: 'subscription_plans.id' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      ]
    },
    {
      name: 'profiles',
      description: 'User profile information',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: null, isPrimaryKey: true, isForeignKey: true, references: 'auth.users.id' },
        { name: 'username', type: 'text', nullable: true, default: null },
        { name: 'full_name', type: 'text', nullable: true, default: null },
        { name: 'avatar_url', type: 'text', nullable: true, default: null },
        { name: 'default_organization_id', type: 'uuid', nullable: true, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' },
      ]
    },
    {
      name: 'organization_members',
      description: 'Organization membership and roles',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'organization_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'user_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'profiles.id' },
        { name: 'role', type: 'role_type', nullable: false, default: 'member' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      ]
    },
    {
      name: 'devices',
      description: 'IoT devices and hardware',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'organization_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'product_template_id', type: 'uuid', nullable: true, default: null, isForeignKey: true, references: 'product_templates.id' },
        { name: 'name', type: 'text', nullable: false, default: null },
        { name: 'type', type: 'text', nullable: false, default: null },
        { name: 'status', type: 'text', nullable: false, default: null },
        { name: 'description', type: 'text', nullable: true, default: null },
        { name: 'last_active_at', type: 'timestamp with time zone', nullable: true, default: 'now()' },
      ]
    },
    {
      name: 'product_templates',
      description: 'Device product templates and configurations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'organization_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'name', type: 'text', nullable: false, default: null },
        { name: 'description', type: 'text', nullable: true, default: null },
        { name: 'version', type: 'text', nullable: false, default: '1.0' },
        { name: 'category', type: 'text', nullable: true, default: null },
        { name: 'tags', type: 'text', nullable: true, default: null },
        { name: 'status', type: 'text', nullable: true, default: 'draft' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      ]
    },
    {
      name: 'device_readings',
      description: 'Sensor data and device measurements',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'device_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'devices.id' },
        { name: 'organization_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'reading_type', type: 'character varying', nullable: false, default: null },
        { name: 'value', type: 'double precision', nullable: false, default: null },
        { name: 'metadata', type: 'jsonb', nullable: true, default: null },
        { name: 'timestamp', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      ]
    },
    {
      name: 'alarms',
      description: 'Alert configurations and monitoring rules',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'organization_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'device_id', type: 'uuid', nullable: true, default: null, isForeignKey: true, references: 'devices.id' },
        { name: 'name', type: 'text', nullable: false, default: null },
        { name: 'description', type: 'text', nullable: true, default: null },
        { name: 'reading_type', type: 'text', nullable: false, default: null },
        { name: 'condition_operator', type: 'condition_operator', nullable: false, default: null },
        { name: 'condition_value', type: 'jsonb', nullable: false, default: null },
        { name: 'severity', type: 'alarm_severity', nullable: false, default: 'warning' },
        { name: 'enabled', type: 'boolean', nullable: false, default: 'true' },
        { name: 'cooldown_minutes', type: 'integer', nullable: false, default: '15' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      ]
    },
    {
      name: 'endpoints',
      description: 'External integrations and webhooks',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'organization_id', type: 'uuid', nullable: false, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'name', type: 'text', nullable: false, default: null },
        { name: 'description', type: 'text', nullable: true, default: null },
        { name: 'type', type: 'text', nullable: false, default: null },
        { name: 'configuration', type: 'jsonb', nullable: false, default: null },
        { name: 'enabled', type: 'boolean', nullable: false, default: 'true' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      ]
    },
    {
      name: 'api_keys',
      description: 'API authentication keys',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()', isPrimaryKey: true },
        { name: 'organization_id', type: 'uuid', nullable: true, default: null, isForeignKey: true, references: 'organizations.id' },
        { name: 'name', type: 'text', nullable: false, default: null },
        { name: 'key_hash', type: 'text', nullable: false, default: null },
        { name: 'prefix', type: 'text', nullable: false, default: null },
        { name: 'scopes', type: 'text[]', nullable: false, default: '{}' },
        { name: 'expires_at', type: 'timestamp with time zone', nullable: true, default: null },
        { name: 'last_used', type: 'timestamp with time zone', nullable: true, default: null },
        { name: 'is_active', type: 'boolean', nullable: true, default: 'true' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true, default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' },
      ]
    }
  ];

  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    if (type.includes('uuid')) return 'bg-purple-100 text-purple-800';
    if (type.includes('text') || type.includes('character')) return 'bg-green-100 text-green-800';
    if (type.includes('timestamp')) return 'bg-blue-100 text-blue-800';
    if (type.includes('boolean')) return 'bg-orange-100 text-orange-800';
    if (type.includes('integer') || type.includes('double')) return 'bg-red-100 text-red-800';
    if (type.includes('jsonb')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const TableCard = ({ table }: { table: Table }) => (
    <Card className={`transition-all duration-200 ${selectedTable === table.name ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
      >
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          {table.name}
        </CardTitle>
        {table.description && (
          <p className="text-sm text-muted-foreground">{table.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {table.columns.map((column, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{column.name}</span>
                {column.isPrimaryKey && (
                  <Badge variant="secondary" className="text-xs">
                    <Key className="h-3 w-3 mr-1" />
                    PK
                  </Badge>
                )}
                {column.isForeignKey && (
                  <Badge variant="outline" className="text-xs">
                    <Link className="h-3 w-3 mr-1" />
                    FK
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getTypeColor(column.type)}`}>
                  {column.type}
                </Badge>
                {!column.nullable && (
                  <Badge variant="destructive" className="text-xs">
                    NOT NULL
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {showRelationships && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Relationships</h4>
            <div className="space-y-1">
              {table.columns
                .filter(col => col.isForeignKey)
                .map((col, index) => (
                  <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    <span className="font-mono">{col.name}</span>
                    <span>→</span>
                    <span className="font-mono">{col.references}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const TableList = ({ table }: { table: Table }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4" />
          {table.name}
        </h3>
        <Badge variant="outline">{table.columns.length.toString()} columns</Badge>
      </div>
      {table.description && (
        <p className="text-sm text-muted-foreground mb-3">{table.description}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Column</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Constraints</th>
              <th className="text-left p-2">Default</th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((column, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{column.name}</span>
                    {column.isPrimaryKey && <Key className="h-3 w-3 text-blue-500" />}
                    {column.isForeignKey && <Link className="h-3 w-3 text-green-500" />}
                  </div>
                </td>
                <td className="p-2">
                  <Badge className={`text-xs ${getTypeColor(column.type)}`}>
                    {column.type}
                  </Badge>
                </td>
                <td className="p-2">
                  <div className="flex gap-1">
                    {!column.nullable && (
                      <Badge variant="destructive" className="text-xs">NOT NULL</Badge>
                    )}
                    {column.isPrimaryKey && (
                      <Badge variant="secondary" className="text-xs">PRIMARY KEY</Badge>
                    )}
                    {column.isForeignKey && (
                      <Badge variant="outline" className="text-xs">FOREIGN KEY</Badge>
                    )}
                  </div>
                </td>
                <td className="p-2 font-mono text-xs text-muted-foreground">
                  {column.default || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Database Schema</h1>
          <p className="text-muted-foreground">
            Visual documentation of the database structure and relationships
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowRelationships(!showRelationships)}
          className="flex items-center gap-2"
        >
          {showRelationships ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showRelationships ? 'Hide' : 'Show'} Relationships
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredTables.length.toString()} tables</Badge>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="list">Table View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((table, index) => (
              <TableCard key={index} table={table} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <ScrollArea className="h-[800px]">
            <div className="space-y-6">
              {filteredTables.map((table, index) => (
                <TableList key={index} table={table} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-500" />
            <span>Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-green-500" />
            <span>Foreign Key</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">NOT NULL</Badge>
            <span>Required Field</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-xs bg-purple-100 text-purple-800">uuid</Badge>
            <span>UUID Type</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchemaChart;
