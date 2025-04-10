
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { invitationServices } from '@/contexts/auth/invitationServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing invitation...');

  useEffect(() => {
    const processInvitation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid invitation link. No token provided.');
        return;
      }

      if (!user) {
        setStatus('error');
        setMessage('You need to be logged in to accept an invitation. Please sign in and try again.');
        return;
      }

      try {
        const result = await invitationServices.acceptInvitation(token);
        
        if (result) {
          setStatus('success');
          setMessage('Invitation accepted successfully! You have been added to the organization.');
        } else {
          setStatus('error');
          setMessage('This invitation is invalid or has expired.');
        }
      } catch (error) {
        console.error('Error accepting invitation:', error);
        setStatus('error');
        setMessage('There was an error accepting the invitation. Please try again later.');
      }
    };

    processInvitation();
  }, [token, user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Organization Invitation</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Processing your invitation...'}
            {status === 'success' && 'Invitation Accepted'}
            {status === 'error' && 'Invitation Error'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === 'loading' && <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />}
          {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
          {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
          
          <p className="mt-4 text-center">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant={status === 'error' ? 'outline' : 'default'}
          >
            {status === 'success' ? 'Go to Dashboard' : 'Back to Dashboard'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
