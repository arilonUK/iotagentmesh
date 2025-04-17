
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface FormActionsProps {
  isLoading: boolean;
  isEditing: boolean;
}

export function FormActions({ isLoading, isEditing }: FormActionsProps) {
  return (
    <Button 
      type="submit" 
      className="w-full sm:w-auto"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Updating..." : "Creating..."}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? "Update Product" : "Create Product"}
        </>
      )}
    </Button>
  );
}
