
import { AlarmConfig, ConditionValue, ThresholdValue, RangeValue } from "@/types/alarm";
import { AlertCircle, Bell, BellOff, Edit, Trash2, TestTube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface AlarmCardProps {
  alarm: AlarmConfig;
  onEdit: (alarm: AlarmConfig) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onTest: (id: string) => void;
  isTesting: boolean;
}

const severityColors = {
  info: "bg-blue-100 text-blue-800 border-blue-300",
  warning: "bg-amber-100 text-amber-800 border-amber-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

const operatorLabels: Record<string, string> = {
  gt: "greater than",
  lt: "less than",
  gte: "greater than or equal to",
  lte: "less than or equal to",
  eq: "equal to",
  neq: "not equal to",
  between: "between",
  outside: "outside",
};

export function AlarmCard({ alarm, onEdit, onDelete, onToggle, onTest, isTesting }: AlarmCardProps) {
  // Format the condition value for display
  const getConditionDisplay = (): string => {
    const conditionValue = alarm.condition_value as ConditionValue;
    if (alarm.condition_operator === 'between' || alarm.condition_operator === 'outside') {
      const rangeValue = conditionValue as RangeValue;
      return `${rangeValue.min || ''} and ${rangeValue.max || ''}`;
    } else {
      const thresholdValue = conditionValue as ThresholdValue;
      return String(thresholdValue.threshold || '');
    }
  };
  
  return (
    <Card className={`transition-all ${!alarm.enabled ? 'opacity-60' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-lg font-medium">{alarm.name}</CardTitle>
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant={alarm.severity === 'critical' ? "destructive" : alarm.severity === 'warning' ? "default" : "secondary"}>
              {alarm.severity}
            </Badge>
            <Badge variant="outline">
              {alarm.device_id ? 'Device-specific' : 'All devices'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center">
          <Switch 
            checked={alarm.enabled}
            onCheckedChange={(checked) => onToggle(alarm.id, checked)}
            aria-label={`${alarm.enabled ? 'Disable' : 'Enable'} alarm`}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {alarm.description && (
            <p className="text-muted-foreground">{alarm.description}</p>
          )}
          
          <div className="pt-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p>
                  <span className="font-medium">Condition:</span>{" "}
                  <span>
                    {alarm.reading_type} is {operatorLabels[alarm.condition_operator]} {getConditionDisplay()}
                  </span>
                </p>
                {alarm.device && (
                  <p className="text-xs text-muted-foreground">
                    Device: {alarm.device.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-2 flex items-start space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p>
                  <span className="font-medium">Notifications:</span>{" "}
                  <span>{alarm.endpoints.length} endpoint{alarm.endpoints.length !== 1 ? 's' : ''}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Cooldown: {alarm.cooldown_minutes} minutes
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onTest(alarm.id)}
              disabled={isTesting}
            >
              <TestTube className="h-3.5 w-3.5 mr-1" />
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(alarm)}>
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(alarm.id)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
