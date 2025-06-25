
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface ErrorType {
  code: string;
  description: string;
  example: string;
}

interface ErrorHandlingSectionProps {
  content: string[];
  errorTypes: ErrorType[];
}

export const ErrorHandlingSection = ({ content, errorTypes }: ErrorHandlingSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Error Handling & Troubleshooting</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Common Error Codes:</h4>
          <div className="space-y-3">
            {errorTypes.map((error, eIndex) => (
              <div key={eIndex} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                    {error.code}
                  </code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{error.description}</p>
                <p className="text-xs text-primary">Example: {error.example}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
