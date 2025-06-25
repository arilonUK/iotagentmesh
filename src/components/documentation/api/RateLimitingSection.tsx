
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface RateLimit {
  plan: string;
  limits: string[];
}

interface RateLimitingSectionProps {
  content: string[];
  rateLimits: RateLimit[];
}

export const RateLimitingSection = ({ content, rateLimits }: RateLimitingSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Rate Limiting & Quotas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Rate Limits by Plan:</h4>
          <div className="grid gap-3 md:grid-cols-3">
            {rateLimits.map((plan, pIndex) => (
              <div key={pIndex} className="border rounded-lg p-3">
                <h5 className="font-medium mb-2">{plan.plan}</h5>
                <ul className="space-y-1">
                  {plan.limits.map((limit, lIndex) => (
                    <li key={lIndex} className="text-xs text-muted-foreground">
                      • {limit}
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
