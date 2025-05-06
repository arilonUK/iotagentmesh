
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ChartType = 'line' | 'bar' | 'area';

interface ChartTypeSelectorProps {
  value: ChartType;
  onValueChange: (value: ChartType) => void;
}

export const ChartTypeSelector = ({ value, onValueChange }: ChartTypeSelectorProps) => {
  return (
    <Select value={value} onValueChange={(value: ChartType) => onValueChange(value)}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Chart type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="line">Line Chart</SelectItem>
        <SelectItem value="bar">Bar Chart</SelectItem>
        <SelectItem value="area">Area Chart</SelectItem>
      </SelectContent>
    </Select>
  );
};
