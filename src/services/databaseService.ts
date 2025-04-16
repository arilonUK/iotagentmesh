
import { supabase } from '@/integrations/supabase/client';

// Helper functions for database management
export const databaseServices = {
  async createFunction(functionName: string, functionDefinition: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('exec_sql', { 
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
      const { data, error } = await supabase
        .rpc('function_exists', { 
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
