
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

interface SecurityAlertProps {
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  onDismiss?: () => void;
}

/**
 * Security alert component for displaying security-related messages
 */
const SecurityAlert: React.FC<SecurityAlertProps> = ({
  type,
  title,
  description,
  onDismiss
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Shield className="h-4 w-4" />;
      case 'info':
        return <Lock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SecurityAlert;
