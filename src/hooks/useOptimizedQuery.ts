
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryCache, QueryCache } from '@/services/cache/QueryCache';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: (string | number)[];
  queryFn: () => Promise<T>;
  cacheConfig?: keyof typeof QueryCache.CACHE_CONFIGS;
  enableCache?: boolean;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  cacheConfig = 'ORGANIZATION_DATA',
  enableCache = true,
  ...options
}: OptimizedQueryOptions<T>) {
  const config = QueryCache.CACHE_CONFIGS[cacheConfig];
  const cacheKey = queryKey.join('_');

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Try cache first if enabled
      if (enableCache) {
        const cachedData = queryCache.get<T>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }

      // Fetch fresh data
      const data = await queryFn();
      
      // Cache the result if enabled
      if (enableCache) {
        queryCache.set(cacheKey, data, config.ttl);
      }

      return data;
    },
    staleTime: config.staleTime,
    gcTime: config.cacheTime, // Updated from cacheTime to gcTime for TanStack Query v5
    ...options,
  });
}

export function invalidateQueryCache(pattern: string) {
  queryCache.invalidate(pattern);
}
