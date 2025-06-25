
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface RefreshWorkflowStep {
  step: string;
  description: string;
  details: string[];
}

interface ApiKeyRefreshWorkflowSectionProps {
  content: string[];
  refreshWorkflow: RefreshWorkflowStep[];
}

export const ApiKeyRefreshWorkflowSection = ({ 
  content, 
  refreshWorkflow 
}: ApiKeyRefreshWorkflowSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">API Key Refresh Workflow</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">API Key Refresh Process:</h4>
          <div className="space-y-4">
            {refreshWorkflow.map((workflow, wIndex) => (
              <div key={wIndex} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {wIndex + 1}
                  </div>
                  <div>
                    <h5 className="font-medium">{workflow.step}</h5>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                <ul className="space-y-1 ml-10">
                  {workflow.details.map((detail, dIndex) => (
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
