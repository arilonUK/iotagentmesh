
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield } from 'lucide-react';

interface BestPracticesSectionProps {
  content: string[];
  bestPractices: string[];
}

export const BestPracticesSection = ({ content, bestPractices }: BestPracticesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Integration Best Practices</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Best Practices:</h4>
          <ul className="grid gap-2">
            {bestPractices.map((practice, pIndex) => (
              <li key={pIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                {practice}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
