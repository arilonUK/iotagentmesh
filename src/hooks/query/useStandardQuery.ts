
import React from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface StandardQueryOptions<TData, TError = Error> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  showErrorToast?: boolean;
  errorMessage?: string;
}

export interface StandardMutationOptions<TData, TError = Error, TVariables = void, TContext = unknown> 
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useStandardQuery = <TData, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: StandardQueryOptions<TData, TError> = {}
) => {
  const { toast } = useToast();
  const { showErrorToast = true, errorMessage, ...queryOptions } = options;

  const query = useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
  });

  // Handle errors using useEffect-like pattern
  React.useEffect(() => {
    if (query.error && showErrorToast) {
      toast({
        title: 'Error',
        description: errorMessage || 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [query.error, showErrorToast, errorMessage, toast]);

  return query;
};

export const useStandardMutation = <TData, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: StandardMutationOptions<TData, TError, TVariables, TContext> = {}
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage,
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error: TError, variables, context) => {
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMessage || 'An error occurred',
          variant: 'destructive',
        });
      }
      options.onError?.(error, variables, context);
    },
  });
};
