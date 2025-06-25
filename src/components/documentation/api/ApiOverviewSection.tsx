
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server } from 'lucide-react';

interface ApiOverviewSectionProps {
  content: string[];
}

export const ApiOverviewSection = ({ content }: ApiOverviewSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">API Integration Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};
