// Client-side fetch wrapper for /api/admin/* — centralizes the error contract:
//   401 → session expired → hard redirect to login (with callbackUrl)
//   429 → RateLimitError (caller shows toast, keeps UI state)
//   400 → ValidationError with .fields (caller maps to inline errors)
//   409 → ConflictError
//   other !ok → ApiError with server message

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
export class RateLimitError extends ApiError {
  constructor() {
    super('Too many requests — slow down for a minute.', 429);
  }
}
export class ValidationError extends ApiError {
  constructor(public fields: Record<string, string[]>, message = 'Validation failed') {
    super(message, 400);
  }
}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (res.status === 401) {
    // Session expired mid-action — send back to login, return here afterwards
    const cb = encodeURIComponent(window.location.pathname);
    window.location.href = `/admin/login?callbackUrl=${cb}`;
    // Never resolves — navigation takes over
    return new Promise<never>(() => {});
  }

  if (res.status === 429) throw new RateLimitError();

  const data = await res.json().catch(() => ({}));

  if (res.status === 400 && data.fields) throw new ValidationError(data.fields, data.error);
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status);

  return data as T;
}
