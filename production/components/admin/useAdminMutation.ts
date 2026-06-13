'use client';

// Shared mutation hook — handles the edge cases every admin form needs:
//  - busy guard: rapid double-click fires exactly ONE request
//  - 400 Zod errors  → onValidation(fields) for inline mapping
//  - 409 conflicts   → onConflict(message) (e.g. slug field)
//  - 429 rate limit  → toast via onError
//  - 401             → adminFetch already redirects to login (callbackUrl)

import { useRef, useState, useCallback } from 'react';
import { ApiError, RateLimitError, ValidationError } from '@/lib/admin-fetch';

interface Handlers<T> {
  onSuccess: (result: T) => void;
  onValidation?: (fields: Record<string, string>) => void;
  onConflict?: (message: string) => void;
  onError: (message: string) => void;
}

export function useAdminMutation<T>() {
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false); // ref guard — state updates are async

  const mutate = useCallback(
    async (fn: () => Promise<T>, handlers: Handlers<T>) => {
      if (inFlight.current) return; // double-click guard
      inFlight.current = true;
      setBusy(true);
      try {
        const result = await fn();
        handlers.onSuccess(result);
      } catch (e) {
        if (e instanceof ValidationError) {
          const errs: Record<string, string> = {};
          for (const [k, v] of Object.entries(e.fields)) if (v?.[0]) errs[k] = v[0];
          handlers.onValidation?.(errs);
        } else if (e instanceof RateLimitError) {
          handlers.onError(e.message);
        } else if (e instanceof ApiError && e.status === 409) {
          (handlers.onConflict ?? handlers.onError)(e.message);
        } else {
          handlers.onError(e instanceof Error ? e.message : 'Request failed');
        }
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    []
  );

  return { mutate, busy };
}
