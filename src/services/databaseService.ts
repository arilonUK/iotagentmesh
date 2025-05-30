
import { supabase } from '@/integrations/supabase/client';

// Helper functions for database management
export const databaseServices = {
  async createFunction(functionName: string, functionDefinition: string): Promise<boolean> {
    try {
      // Use type assertion to bypass TypeScript restriction
      const { error } = await (supabase
        .rpc as any)('exec_sql', { 
          sql: functionDefinition 
        });
      
      if (error) {
        console.error(`Error creating function ${functionName}:`, error);
        return false;
      }
      
      console.log(`Function ${functionName} created successfully`);
      return true;
    } catch (error) {
      console.error(`Exception creating function ${functionName}:`, error);
      return false;
    }
  },
  
  async functionExists(functionName: string): Promise<boolean> {
    try {
      // Use type assertion to bypass TypeScript restriction
      const { data, error } = await (supabase
        .rpc as any)('function_exists', { 
          function_name: functionName 
        });
      
      if (error) {
        console.error(`Error checking if function ${functionName} exists:`, error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error(`Exception checking if function ${functionName} exists:`, error);
      return false;
    }
  }
};
