
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useAlarms } from '@/hooks/useAlarms';
import { AlarmConfig } from '@/types/alarm';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import AlarmList from '@/components/alarms/AlarmList';
import AlarmForm from '@/components/alarms/AlarmForm';
import { AlarmDeleteDialog } from '@/components/alarms/AlarmDeleteDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const AlarmsComponent = function Alarms() {
  const { profile } = useAuth();
  const organizationId = profile?.default_organization_id;
  
  const [isCreating, setIsCreating] = useState(false);
  const [editAlarm, setEditAlarm] = useState<AlarmConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [deleteAlarmId, setDeleteAlarmId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { 
    alarms, 
    isLoading,
    createAlarm, 
    updateAlarm, 
    deleteAlarm,
    toggleAlarm,
    testAlarm,
    isCreating: isSubmittingCreate,
    isUpdating: isSubmittingUpdate,
    isTesting
  } = useAlarms(organizationId);

  const handleCreateSubmit = (data) => {
    createAlarm(data, {
      onSuccess: () => {
        setIsCreating(false);
        setActiveTab('list');
        toast.success('Alarm created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create alarm');
        console.error('Create alarm error:', error);
      }
    });
  };

  const handleUpdateSubmit = (data) => {
    if (!editAlarm) return;

    updateAlarm({ id: editAlarm.id, data }, {
      onSuccess: () => {
        setEditAlarm(null);
        setActiveTab('list');
        toast.success('Alarm updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update alarm');
        console.error('Update alarm error:', error);
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeleteAlarmId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteAlarmId) {
      deleteAlarm(deleteAlarmId, {
        onSuccess: () => {
          toast.success('Alarm deleted successfully');
        },
        onError: (error) => {
          toast.error('Failed to delete alarm');
          console.error('Delete alarm error:', error);
        }
      });
      setDeleteAlarmId(null);
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    toggleAlarm({ id, enabled }, {
      onSuccess: () => {
        toast.success(`Alarm ${enabled ? 'enabled' : 'disabled'}`);
      },
      onError: (error) => {
        toast.error('Failed to update alarm status');
        console.error('Toggle alarm error:', error);
      }
    });
  };

  const handleTest = (id: string) => {
    testAlarm(id, {
      onSuccess: () => {
        toast.success('Alarm test completed successfully');
      },
      onError: (error) => {
        toast.error('Failed to test alarm');
        console.error('Test alarm error:', error);
      }
    });
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditAlarm(null);
    setActiveTab('form');
  };

  const startEditing = (alarm: AlarmConfig) => {
    setEditAlarm(alarm);
    setIsCreating(false);
    setActiveTab('form');
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditAlarm(null);
    setActiveTab('list');
};

AlarmsComponent.displayName = 'Alarms';
export default AlarmsComponent;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Alarms</h1>
          <p className="text-muted-foreground">
            Configure alerts for your device readings and sensor data
          </p>
        </div>
        
        {activeTab === 'list' && (
          <Button onClick={startCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Create Alarm
          </Button>
        )}

        {activeTab === 'form' && (
          <Button variant="outline" onClick={cancelForm}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          <TabsTrigger value="list">Alarm List</TabsTrigger>
          <TabsTrigger value="form">Create/Edit Alarm</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          <AlarmList
            alarms={alarms}
            isLoading={isLoading}
            onEdit={startEditing}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onTest={handleTest}
            isTesting={isTesting}
          />
        </TabsContent>
        
        <TabsContent value="form" className="mt-0">
          {(isCreating || editAlarm) && (
            <AlarmForm
              organizationId={organizationId!}
              initialData={editAlarm || undefined}
              onSubmit={editAlarm ? handleUpdateSubmit : handleCreateSubmit}
              isSubmitting={editAlarm ? isSubmittingUpdate : isSubmittingCreate}
            />
          )}
        </TabsContent>
      </Tabs>

      <AlarmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
