
import { QueryClient } from '@tanstack/react-query';

// Create singleton query client
let globalQueryClient: QueryClient | null = null;

export const createQueryClient = () => {
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: (failureCount, error: unknown) => {
            const err = error as { status?: number };
            if (err?.status && err.status >= 400 && err.status < 500) {
              return false;
            }
            return failureCount < 3;
          },
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: false,
        },
      },
    });
  }
  return globalQueryClient;
};
