
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleTime: number; // Time before considering data stale
  cacheTime: number; // Time to keep in cache after component unmount
}

class QueryCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_STALE_TIME = 1 * 60 * 1000; // 1 minute
  private readonly DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

  // Cache configurations for different types of data
  static readonly CACHE_CONFIGS = {
    TIMEZONE_DATA: {
      ttl: 24 * 60 * 60 * 1000, // 24 hours - timezones rarely change
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    },
    SCHEMA_METADATA: {
      ttl: 30 * 60 * 1000, // 30 minutes - schema changes infrequent
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
    },
    ORGANIZATION_DATA: {
      ttl: 5 * 60 * 1000, // 5 minutes
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    FUNCTION_METADATA: {
      ttl: 60 * 60 * 1000, // 1 hour - functions change rarely
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 2 * 60 * 60 * 1000, // 2 hours
    },
  } as const;

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.DEFAULT_TTL);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  isStale(key: string, staleTime: number = this.DEFAULT_STALE_TIME): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp > staleTime;
  }

  invalidate(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiry) {
        expired++;
      } else {
        valid++;
      }
    }
    
    return {
      total: this.cache.size,
      valid,
      expired,
      hitRate: valid / (valid + expired) || 0,
    };
  }
}

// Export singleton instance
export const queryCache = new QueryCacheManager();

// Export class for testing
export { QueryCacheManager, type CacheConfig };

// Auto-cleanup every 5 minutes
setInterval(() => {
  queryCache.cleanup();
}, 5 * 60 * 1000);
