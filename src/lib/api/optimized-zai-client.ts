/**
 * Optimized API Client for Enhanced Performance
 * Implements caching, deduplication, retries, and performance monitoring
 */

import type { TechStack } from "@/types";

export interface EnhancePromptParams {
  userInput: string;
  wordLimit: number;
  selectorPath?: string;
  techStack: TechStack;
}

export interface ApiResponse {
  yaml?: string;
  error?: string;
  translation?: {
    originalText: string;
    translatedText: string;
    originalLanguage: string;
    originalLanguageName: string;
    wasTranslated: boolean;
    confidence: number;
  };
}

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  cacheHit: boolean;
  fromTranslationCache: boolean;
  error?: string;
}

export interface EnhancedResult {
  yaml: string;
  translation?: ApiResponse["translation"];
  metrics: PerformanceMetrics;
  fromCache: boolean;
}

// Configuration constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Performance tracking
let performanceHistory: PerformanceMetrics[] = [];
let cacheHitCount = 0;
let cacheMissCount = 0;

// Cache implementation
interface CacheEntry {
  data: EnhancedResult;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
  }

  set(key: string, data: EnhancedResult, ttl: number = CACHE_TTL): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): EnhancedResult | null {
    const entry = this.cache.get(key);
    if (!entry) {
      cacheMissCount++;
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      cacheMissCount++;
      return null;
    }

    cacheHitCount++;
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<EnhancedResult>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise as Promise<EnhancedResult>);
    return promise as Promise<T>;
  }
}

// Global instances
const apiCache = new APICache();
const requestDeduplicator = new RequestDeduplicator();

// Clean up expired cache entries periodically
setInterval(() => apiCache.cleanup(), 60000); // Every minute

/**
 * Create a cache key from request parameters
 */
function createCacheKey(params: EnhancePromptParams): string {
  return JSON.stringify({
    input: params.userInput.trim().toLowerCase(),
    wordLimit: params.wordLimit,
    selectorPath: params.selectorPath?.trim().toLowerCase() || '',
    techStack: {
      frontend: [...params.techStack.frontend].sort(),
      backend: [...params.techStack.backend].sort(),
      database: [...params.techStack.database].sort(),
      tools: [...params.techStack.tools].sort(),
      uiComponents: [...params.techStack.uiComponents || []].sort()
    }
  });
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  return RETRY_DELAY * Math.pow(2, attempt - 1) + Math.random() * 1000;
}

/**
 * Make HTTP request with timeout and retries
 */
async function makeRequest(params: EnhancePromptParams, attempt: number = 1): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch("/api/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add request ID for debugging
        "X-Request-ID": crypto.randomUUID(),
        // Add attempt number for server-side tracking
        "X-Retry-Attempt": attempt.toString(),
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiResponse;
      throw new Error(errorData.error ?? `API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as ApiResponse;

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.yaml) {
      throw new Error("The API returned an empty response.");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Don't retry if it's an abort (timeout) or if we've exceeded max retries
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("Request timeout - please try again");
    }

    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    // Retry with exponential backoff
    const delay = getRetryDelay(attempt);
    console.warn(`API request failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms:`, error);
    await sleep(delay);

    return makeRequest(params, attempt + 1);
  }
}

/**
 * Enhanced API client with caching, deduplication, and performance monitoring
 */
export async function enhancePromptOptimized(
  params: EnhancePromptParams
): Promise<EnhancedResult> {
  const startTime = performance.now();
  const cacheKey = createCacheKey(params);

  // Check cache first
  const cachedResult = apiCache.get(cacheKey);
  if (cachedResult) {
    const endTime = performance.now();
    const metrics: PerformanceMetrics = {
      startTime,
      endTime,
      duration: endTime - startTime,
      cacheHit: true,
      fromTranslationCache: false
    };

    return {
      ...cachedResult,
      metrics,
      fromCache: true
    };
  }

  // Deduplicate identical in-flight requests
  return requestDeduplicator.deduplicate(cacheKey, async () => {
    try {
      const response = await makeRequest(params);
      const endTime = performance.now();

      const metrics: PerformanceMetrics = {
        startTime,
        endTime,
        duration: endTime - startTime,
        cacheHit: false,
        fromTranslationCache: false
      };

      const result: EnhancedResult = {
        yaml: response.yaml,
        translation: response.translation,
        metrics,
        fromCache: false
      };

      // Cache successful results
      apiCache.set(cacheKey, result);

      // Record performance metrics
      performanceHistory.push(metrics);
      if (performanceHistory.length > 1000) {
        performanceHistory = performanceHistory.slice(-1000);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const metrics: PerformanceMetrics = {
        startTime,
        endTime,
        duration: endTime - startTime,
        cacheHit: false,
        fromTranslationCache: false,
        error: errorMessage
      };

      performanceHistory.push(metrics);
      if (performanceHistory.length > 1000) {
        performanceHistory = performanceHistory.slice(-1000);
      }

      throw error;
    }
  });
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (performanceHistory.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      fastestRequest: 0,
      slowestRequest: 0
    };
  }

  const successfulRequests = performanceHistory.filter(m => !m.error);
  const failedRequests = performanceHistory.filter(m => m.error);
  const durations = successfulRequests.map(m => m.duration);

  return {
    totalRequests: performanceHistory.length,
    averageResponseTime: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    cacheHitRate: cacheHitCount / (cacheHitCount + cacheMissCount) || 0,
    errorRate: failedRequests.length / performanceHistory.length,
    fastestRequest: Math.min(...durations),
    slowestRequest: Math.max(...durations),
    cacheSize: apiCache.size()
  };
}

/**
 * Clear cache and reset metrics
 */
export function clearCache(): void {
  apiCache.clear();
  performanceHistory = [];
  cacheHitCount = 0;
  cacheMissCount = 0;
}

/**
 * Preload cache for common requests
 */
export async function preloadCache(commonRequests: EnhancePromptParams[]): Promise<void> {
  const preloadPromises = commonRequests.slice(0, 3).map(params => {
    const cacheKey = createCacheKey(params);
    if (!apiCache.get(cacheKey)) {
      return enhancePromptOptimized(params).catch(error => {
        console.warn('Failed to preload cache:', error);
      });
    }
    return Promise.resolve();
  });

  await Promise.allSettled(preloadPromises);
}

// Backward compatibility
export const enhancePrompt = enhancePromptOptimized;