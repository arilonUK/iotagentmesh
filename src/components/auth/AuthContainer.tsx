
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthContainer = () => {
  const [authError, setAuthError] = useState<string | null>(null);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Welcome to IoTAgentMesh</h1>
        <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
      </div>

      {authError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6">
          <LoginForm setAuthError={setAuthError} />
        </TabsContent>

        <TabsContent value="signup" className="mt-6">
          <SignupForm setAuthError={setAuthError} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthContainer;
