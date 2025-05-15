
import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet, CalendarClock } from 'lucide-react';
import { downloadCSV, downloadJSON } from '@/utils/export';
import { toast } from 'sonner';

interface DataExportMenuProps<T extends Record<string, any>> {
  data: T[];
  fileName?: string;
  triggerText?: string;
  triggerClassName?: string;
}

export function DataExportMenu<T extends Record<string, any>>({
  data,
  fileName = 'export',
  triggerText = 'Export',
  triggerClassName,
}: DataExportMenuProps<T>) {
  const handleExportCSV = () => {
    try {
      downloadCSV(data, `${fileName}.csv`);
      toast.success('Data exported as CSV successfully');
    } catch (error) {
      console.error('Error exporting as CSV:', error);
      toast.error('Failed to export data as CSV');
    }
  };

  const handleExportJSON = () => {
    try {
      downloadJSON(data, `${fileName}.json`);
      toast.success('Data exported as JSON successfully');
    } catch (error) {
      console.error('Error exporting as JSON:', error);
      toast.error('Failed to export data as JSON');
    }
  };

  // Check if there's any data to export
  const isEmpty = !data || data.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={triggerClassName}
          disabled={isEmpty}
        >
          <Download className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <CalendarClock className="mr-2 h-4 w-4" />
          Schedule Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
