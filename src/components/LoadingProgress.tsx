
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingProgressProps {
  progress: number;
  title?: string;
  description?: string;
  showPercentage?: boolean;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress,
  title = "Loading...",
  description = "Initializing application components",
  showPercentage = true
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              {showPercentage && (
                <p className="text-xs text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              )}
            </div>
            
            {progress < 100 && (
              <div className="text-xs text-muted-foreground">
                Optimizing performance...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
