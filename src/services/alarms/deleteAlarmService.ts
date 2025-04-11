
import { supabase } from '@/integrations/supabase/client';
import { handleServiceError } from './baseAlarmService';
import { toast } from 'sonner';

/**
 * Delete an alarm
 */
export async function deleteAlarm(alarmId: string): Promise<boolean> {
  try {
    // Using generic query to avoid TypeScript issues
    const { error } = await supabase
      .from('alarms')
      .delete()
      .eq('id', alarmId);

    if (error) {
      handleServiceError(error, 'deleting alarm');
      return false;
    }

    toast.success('Alarm deleted successfully');
    return true;
  } catch (error) {
    handleServiceError(error, 'deleteAlarm');
    return false;
  }
}
