// Bounded retry utilities with circuit breaker pattern

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

// Simple in-memory circuit breaker
const circuitBreakers = new Map<string, CircuitBreakerState>();

const CIRCUIT_BREAKER_THRESHOLD = 5; // Open circuit after 5 failures
const CIRCUIT_BREAKER_COOLDOWN = 30000; // 30 seconds cooldown

// Bounded retry function with exponential backoff
export async function withRetries<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 500,
    maxDelay = 5000,
    backoffMultiplier = 2,
    timeout = 10000
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to each attempt
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        )
      ]);
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);
      console.log(`Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

// Circuit breaker wrapper
export async function withCircuitBreaker<T>(
  operationId: string,
  operation: () => Promise<T>
): Promise<T> {
  const breaker = circuitBreakers.get(operationId) || {
    failures: 0,
    lastFailureTime: 0,
    isOpen: false
  };

  // Check if circuit is open and cooldown period has passed
  if (breaker.isOpen) {
    const now = Date.now();
    if (now - breaker.lastFailureTime < CIRCUIT_BREAKER_COOLDOWN) {
      throw new Error(`Circuit breaker is open for operation: ${operationId}. Try again later.`);
    } else {
      // Reset circuit breaker after cooldown
      breaker.isOpen = false;
      breaker.failures = 0;
    }
  }

  try {
    const result = await operation();
    
    // Success - reset failure count
    if (breaker.failures > 0) {
      breaker.failures = 0;
      circuitBreakers.set(operationId, breaker);
    }
    
    return result;
  } catch (error) {
    // Track failure
    breaker.failures++;
    breaker.lastFailureTime = Date.now();
    
    // Open circuit if threshold reached
    if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
      breaker.isOpen = true;
      console.warn(`Circuit breaker opened for operation: ${operationId} after ${breaker.failures} failures`);
    }
    
    circuitBreakers.set(operationId, breaker);
    throw error;
  }
}

// Combined retry with circuit breaker
export async function withRetriesAndCircuitBreaker<T>(
  operationId: string,
  operation: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return withCircuitBreaker(operationId, () => 
    withRetries(operation, retryOptions)
  );
}

// Utility to reset a specific circuit breaker
export function resetCircuitBreaker(operationId: string): void {
  circuitBreakers.delete(operationId);
}

// Utility to get circuit breaker status
export function getCircuitBreakerStatus(operationId: string): CircuitBreakerState | null {
  return circuitBreakers.get(operationId) || null;
}