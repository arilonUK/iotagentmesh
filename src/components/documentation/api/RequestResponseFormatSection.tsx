
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface RequestExample {
  title: string;
  code: string;
}

interface RequestResponseFormatSectionProps {
  content: string[];
  requestExamples: RequestExample[];
}

export const RequestResponseFormatSection = ({ 
  content, 
  requestExamples 
}: RequestResponseFormatSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Request & Response Format</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Request Examples:</h4>
          <div className="space-y-4">
            {requestExamples.map((example, eIndex) => (
              <div key={eIndex}>
                <h5 className="text-sm font-medium mb-2">{example.title}</h5>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
