
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  link: string;
}

interface QuickActionsCardProps {
  quickActions: QuickAction[];
}

export const QuickActionsCard = ({ quickActions }: QuickActionsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Jump to common API integration tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <action.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">{action.title}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(action.link)}
                >
                  {action.action}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
