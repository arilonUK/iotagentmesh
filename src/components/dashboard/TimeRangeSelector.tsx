
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'custom';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  onCustomRangeChange?: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export const TimeRangeSelector = ({
  value,
  onChange,
  onCustomRangeChange,
  className
}: TimeRangeSelectorProps) => {
  const [customStartDate, setCustomStartDate] = React.useState<Date | undefined>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [customEndDate, setCustomEndDate] = React.useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onChange('custom');
      onCustomRangeChange?.(customStartDate, customEndDate);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="bg-muted rounded-md flex">
        <Button
          variant={value === 'hour' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange('hour')}
        >
          Hour
        </Button>
        <Button
          variant={value === 'day' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange('day')}
        >
          Day
        </Button>
        <Button
          variant={value === 'week' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange('week')}
        >
          Week
        </Button>
        <Button
          variant={value === 'month' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange('month')}
        >
          Month
        </Button>
      </div>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={value === 'custom' ? 'secondary' : 'outline'}
            size="sm"
            className="ml-2"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {value === 'custom' && customStartDate && customEndDate ? (
              `${format(customStartDate, "MMM d")} - ${format(customEndDate, "MMM d")}`
            ) : (
              "Custom Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            <div className="border-r p-3">
              <h4 className="text-sm font-medium mb-2">Start Date</h4>
              <CalendarComponent
                mode="single"
                selected={customStartDate}
                onSelect={setCustomStartDate}
                initialFocus
                disabled={(date) => date > new Date() || (customEndDate ? date > customEndDate : false)}
              />
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium mb-2">End Date</h4>
              <CalendarComponent
                mode="single"
                selected={customEndDate}
                onSelect={setCustomEndDate}
                initialFocus
                disabled={(date) => 
                  date > new Date() || 
                  (customStartDate ? date < customStartDate : false)
                }
              />
            </div>
          </div>
          <div className="p-3 border-t flex justify-end">
            <Button size="sm" onClick={handleCustomDateChange}>
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
