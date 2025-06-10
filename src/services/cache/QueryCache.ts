
import { QueryClient } from '@tanstack/react-query';

interface CacheConfig {
  ttl: number;
  staleTime: number;
  cacheTime: number;
}

export class QueryCache {
  private static instance: QueryCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private constructor() {}

  static getInstance(): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache();
    }
    return QueryCache.instance;
  }

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  invalidate(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }

  // Updated cache configurations for better performance
  static readonly CACHE_CONFIGS = {
    FUNCTION_METADATA: {
      ttl: 3600000, // 1 hour
      staleTime: 1800000, // 30 minutes
      cacheTime: 3600000 // 1 hour (will be used as gcTime)
    },
    ORGANIZATION_DATA: {
      ttl: 600000, // 10 minutes
      staleTime: 300000, // 5 minutes
      cacheTime: 600000 // 10 minutes
    },
    DEVICE_LIST: {
      ttl: 300000, // 5 minutes
      staleTime: 120000, // 2 minutes
      cacheTime: 300000 // 5 minutes
    }
  } as const;
}

export const queryCache = QueryCache.getInstance();
