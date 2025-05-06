
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { useState, useEffect } from 'react';

export function NotificationBell() {
  const { unreadCount, notifications, isLoading, markAsRead, markAllAsRead, refetch } = useNotifications();
  const [open, setOpen] = useState(false);
  
  // Refetch notifications when popover opens
  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationList 
          notifications={notifications} 
          isLoading={isLoading} 
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}
