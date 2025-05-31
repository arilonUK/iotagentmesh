
import { AlarmConfig } from "@/types/alarm";
import { AlarmCard } from "./AlarmCard";
import { CircleAlert } from "lucide-react";

interface AlarmListProps {
  alarms: AlarmConfig[];
  isLoading: boolean;
  onEdit: (alarm: AlarmConfig) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onTest: (id: string) => void;
  isTesting: boolean;
}

export default function AlarmList({
  alarms,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  onTest,
  isTesting
}: AlarmListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (alarms.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <CircleAlert className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No alarms configured</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first alarm.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {alarms.map((alarm) => (
        <AlarmCard
          key={alarm.id}
          alarm={alarm}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          onTest={onTest}
          isTesting={isTesting}
        />
      ))}
    </div>
  );
}
