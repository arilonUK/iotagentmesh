
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, RefreshCw } from 'lucide-react';

interface KeyManagementFeature {
  title: string;
  description: string;
  details: string[];
}

interface ApiKeyManagementSectionProps {
  content: string[];
  steps: string[];
  keyManagementFeatures: KeyManagementFeature[];
}

export const ApiKeyManagementSection = ({ 
  content, 
  steps, 
  keyManagementFeatures 
}: ApiKeyManagementSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Key className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">API Authentication & Key Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Step-by-step Process:</h4>
          <ol className="space-y-2">
            {steps.map((step, stepIndex) => (
              <li key={stepIndex} className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                  {stepIndex + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Key Management Features:</h4>
          <div className="space-y-4">
            {keyManagementFeatures.map((feature, fIndex) => (
              <div key={fIndex} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <h5 className="font-medium">{feature.title}</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.details.map((detail, dIndex) => (
                    <li key={dIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
