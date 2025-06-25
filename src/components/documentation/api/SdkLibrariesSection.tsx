
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

interface Sdk {
  language: string;
  description: string;
  features: string[];
}

interface SdkLibrariesSectionProps {
  content: string[];
  sdks: Sdk[];
}

export const SdkLibrariesSection = ({ content, sdks }: SdkLibrariesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Code className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">SDKs & Client Libraries</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Available SDKs:</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {sdks.map((sdk, sIndex) => (
              <div key={sIndex} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-primary" />
                  <h5 className="font-medium">{sdk.language}</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{sdk.description}</p>
                <div>
                  <span className="text-xs font-medium">Features:</span>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {sdk.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
