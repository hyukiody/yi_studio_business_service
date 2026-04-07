'use client';

import { useState, useCallback } from 'react';
import { ICaptchaValidator } from '@/lib/telemetry/interfaces';

/**
 * Single Responsibility Principle (SRP)
 * Delegated Responsibility: Turnstile validation hook
 * 
 * This hook encapsulates ONLY cryptographic validation logic.
 * It does not render DOM or manage network state directly.
 */

interface UseTurnstileValidationReturn {
  token: string | null;
  isValidating: boolean;
  error: string | null;
  onTokenReceived: (token: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for Cloudflare Turnstile CAPTCHA validation
 * Delegates to validator service - allows swapping providers without component changes
 */
export function useTurnstileValidation(
  validator: ICaptchaValidator
): UseTurnstileValidationReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTokenReceived = useCallback(
    async (receivedToken: string) => {
      setIsValidating(true);
      setError(null);

      try {
        const isValid = await validator.validateToken(receivedToken);
        if (isValid) {
          setToken(receivedToken);
        } else {
          setError(validator.getError() || 'Validation failed');
          setToken(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown validation error');
        setToken(null);
      } finally {
        setIsValidating(false);
      }
    },
    [validator]
  );

  const reset = useCallback(() => {
    setToken(null);
    setError(null);
    setIsValidating(false);
  }, []);

  return {
    token,
    isValidating,
    error,
    onTokenReceived,
    reset,
  };
}
