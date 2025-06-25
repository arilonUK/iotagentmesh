
import { format, differenceInDays } from 'date-fns';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ApiKeyExpirationBadgeProps {
  expiresAt: string | null;
  onRefreshClick?: () => void;
  canRefresh?: boolean;
}

export const ApiKeyExpirationBadge = ({ 
  expiresAt, 
  onRefreshClick, 
  canRefresh = false 
}: ApiKeyExpirationBadgeProps) => {
  if (!expiresAt) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Never expires
      </Badge>
    );
  }
  
  const expDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = differenceInDays(expDate, now);
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let icon = <Clock className="h-3 w-3" />;
  let text = `Expires ${format(expDate, 'MMM d, yyyy')}`;
  let showRefreshButton = false;
  
  if (daysUntilExpiry < 0) {
    variant = "destructive";
    icon = <AlertTriangle className="h-3 w-3" />;
    text = "Expired";
    showRefreshButton = canRefresh;
  } else if (daysUntilExpiry <= 7) {
    variant = "destructive";
    icon = <AlertTriangle className="h-3 w-3" />;
    text = `Expires in ${daysUntilExpiry} days`;
    showRefreshButton = canRefresh;
  } else if (daysUntilExpiry <= 30) {
    variant = "secondary";
    icon = <Clock className="h-3 w-3" />;
    text = `Expires in ${daysUntilExpiry} days`;
    showRefreshButton = canRefresh && daysUntilExpiry <= 14;
  }
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {text}
      </Badge>
      {showRefreshButton && onRefreshClick && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshClick}
                className="h-6 px-2 text-xs"
              >
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate a new API key</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
