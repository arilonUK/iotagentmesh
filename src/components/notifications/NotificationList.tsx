
import { useState } from 'react';
import { Notification } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => Promise<boolean>;
  onMarkAllAsRead: () => Promise<boolean>;
}

export function NotificationList({ 
  notifications, 
  isLoading, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationListProps) {
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  
  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const hasUnread = unreadNotifications.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium text-base">Notifications</h3>
        {hasUnread && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead} 
            disabled={isMarkingAllRead}
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      {/* Body */}
      <ScrollArea className="max-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <Bell className="h-10 w-10 mb-2 opacity-20" />
            <p>No notifications yet</p>
            <p className="text-sm">We'll notify you when something happens</p>
          </div>
        ) : (
          <ul className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkAsRead={onMarkAsRead}
                getNotificationIcon={getNotificationIcon} 
              />
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<boolean>;
  getNotificationIcon: (type: string) => React.ReactNode;
}

function NotificationItem({ notification, onMarkAsRead, getNotificationIcon }: NotificationItemProps) {
  const [isMarking, setIsMarking] = useState(false);
  const { id, title, content, type, created_at, is_read } = notification;
  
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (is_read) return;
    
    setIsMarking(true);
    try {
      await onMarkAsRead(id);
    } finally {
      setIsMarking(false);
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true });
  const exactTime = format(new Date(created_at), 'PPpp');
  
  return (
    <li 
      className={cn(
        "flex gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
        !is_read && "bg-muted/30"
      )}
      onClick={handleMarkAsRead}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(type)}
      </div>
      <div className="flex-grow">
        <p className={cn("text-sm font-medium", !is_read && "font-semibold")}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {content}
        </p>
        <p className="text-xs text-muted-foreground mt-1" title={exactTime}>
          {timeAgo}
        </p>
      </div>
      {!is_read && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
        </div>
      )}
    </li>
  );
}
