
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server } from 'lucide-react';

interface EndpointCategory {
  category: string;
  description: string;
  endpoints: string[];
}

interface ApiEndpointsSectionProps {
  content: string[];
  endpointCategories: EndpointCategory[];
}

export const ApiEndpointsSection = ({ content, endpointCategories }: ApiEndpointsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Core API Endpoints</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">API Endpoint Categories:</h4>
          <div className="space-y-4">
            {endpointCategories.map((category, cIndex) => (
              <div key={cIndex} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-primary" />
                  <h5 className="font-medium">{category.category}</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <ul className="space-y-1">
                  {category.endpoints.map((endpoint, eIndex) => (
                    <li key={eIndex} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {endpoint}
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
