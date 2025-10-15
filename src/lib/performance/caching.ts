// Caching strategies for better performance

// Simple in-memory cache for API responses
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const memoryCache = new MemoryCache();

// Enhanced fetch with caching
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const key = cacheKey || url;

  // Check cache first
  const cached = memoryCache.get(key);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache the result
  memoryCache.set(key, data, ttl);

  return data;
}

// LocalStorage cache with size limits
class LocalStorageCache {
  private readonly maxSize = 50; // Maximum number of items
  private readonly keyPrefix = 'prompt-enhancer-cache-';

  set(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): void {
    try {
      if (typeof window === 'undefined') return;

      const prefixedKey = this.keyPrefix + key;
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };

      localStorage.setItem(prefixedKey, JSON.stringify(item));

      // Clean up old items if cache is too large
      this.cleanup();
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
    }
  }

  get(key: string): any | null {
    try {
      if (typeof window === 'undefined') return null;

      const prefixedKey = this.keyPrefix + key;
      const itemStr = localStorage.getItem(prefixedKey);

      if (!itemStr) return null;

      const item = JSON.parse(itemStr);

      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(prefixedKey);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      if (typeof window === 'undefined') return;

      const prefixedKey = this.keyPrefix + key;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.warn('LocalStorage cache delete failed:', error);
    }
  }

  private cleanup(): void {
    try {
      if (typeof window === 'undefined') return;

      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.keyPrefix))
        .map(key => key.replace(this.keyPrefix, ''));

      if (keys.length <= this.maxSize) return;

      // Sort by timestamp and remove oldest
      const items = keys.map(key => {
        const item = localStorage.getItem(this.keyPrefix + key);
        if (!item) return { key, timestamp: 0 };
        const parsed = JSON.parse(item);
        return { key, timestamp: parsed.timestamp || 0 };
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest items
      const itemsToRemove = items.slice(0, items.length - this.maxSize);
      itemsToRemove.forEach(({ key }) => {
        localStorage.removeItem(this.keyPrefix + key);
      });
    } catch (error) {
      console.warn('LocalStorage cache cleanup failed:', error);
    }
  }

  clear(): void {
    try {
      if (typeof window === 'undefined') return;

      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.keyPrefix));

      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error);
    }
  }
}

export const localStorageCache = new LocalStorageCache();

// Response caching for API calls
export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
}

class ResponseCache {
  private cache = new Map<string, CachedResponse<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000, etag?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      etag
    });
  }

  get<T>(key: string, etag?: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Check ETag if provided
    if (etag && entry.etag !== etag) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const responseCache = new ResponseCache();

// Cache configuration
export const CACHE_CONFIG = {
  // Cache TTL in milliseconds
  TTL: {
    SHORT: 5 * 60 * 1000,        // 5 minutes
    MEDIUM: 30 * 60 * 1000,      // 30 minutes
    LONG: 2 * 60 * 60 * 1000,    // 2 hours
    DAILY: 24 * 60 * 60 * 1000,  // 24 hours
  },

  // Cache keys
  KEYS: {
    UI_COMPONENTS: 'ui-components-data',
    TECH_STACK: 'tech-stack-config',
    USER_PREFERENCES: 'user-preferences',
    API_RESPONSE: 'api-response',
  },

  // Cache sizes
  SIZES: {
    MEMORY_MAX: 100,            // Max items in memory cache
    LOCAL_STORAGE_MAX: 50,       // Max items in localStorage
  },
};

// Auto cleanup interval (in milliseconds)
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Auto cleanup expired cache entries
if (typeof window !== 'undefined') {
  setInterval(() => {
    responseCache.cleanup();
    memoryCache.clear(); // Memory cache is simple, just clear periodically
  }, CLEANUP_INTERVAL);
}

// Cache utilities
export const cacheUtils = {
  // Generate cache key with parameters
  generateKey(base: string, params: Record<string, any> = {}): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return paramString ? `${base}:${paramString}` : base;
  },

  // Check if cache is stale
  isStale(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  },

  // Get cache stats
  getStats() {
    return {
      memoryCache: {
        size: memoryCache.size(),
      },
      responseCache: {
        size: responseCache.size(),
      },
      localStorage: {
        size: Object.keys(localStorage).filter(key =>
          key.startsWith('prompt-enhancer-cache-')
        ).length,
      },
    };
  },
};