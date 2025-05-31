
import React from 'react';
import { passwordSchema } from '@/lib/security';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

/**
 * Password strength indicator component
 */
const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true
}) => {
  const calculateStrength = (pwd: string): number => {
    let score = 0;
    
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;
    
    return Math.min(score, 100);
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const strength = calculateStrength(password);
  const requirements = [
    { test: password.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { test: /[a-z]/.test(password), label: 'One lowercase letter' },
    { test: /[0-9]/.test(password), label: 'One number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'One special character' }
  ];

  const isValid = passwordSchema.safeParse(password).success;

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Progress value={strength} className="flex-1" />
        <span className={`text-sm font-medium ${
          strength < 60 ? 'text-red-600' : 'text-green-600'
        }`}>
          {getStrengthLabel(strength)}
        </span>
      </div>
      
      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs ${
                req.test ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <span>{req.test ? '✓' : '○'}</span>
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {strength >= 80 && isValid && (
        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <span>🛡️</span>
          <span>Password meets security requirements</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
