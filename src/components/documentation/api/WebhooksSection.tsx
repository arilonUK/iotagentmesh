
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook } from 'lucide-react';

interface WebhooksSectionProps {
  content: string[];
  webhookFeatures: string[];
}

export const WebhooksSection = ({ content, webhookFeatures }: WebhooksSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Webhook className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Webhooks & Real-time Integration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div>
          <h4 className="font-semibold mb-3">Webhook Features:</h4>
          <ul className="grid gap-2 md:grid-cols-2">
            {webhookFeatures.map((feature, fIndex) => (
              <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Webhook className="h-3 w-3 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
