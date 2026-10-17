/**
 * Validates and sanitizes a return URL.
 * Only allows same-origin relative paths (e.g. '/flights?...').
 * Rejects protocol-relative ('//...'), backslash ('/\...'), and absolute URLs.
 */
export function safeReturnTo(value: string | null | undefined, fallback: string): string {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();

  // Must begin with a single '/' and not with '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  try {
    const dummyBase = 'http://localhost';
    const parsed = new URL(trimmed, dummyBase);

    // Ensure the URL parsed against the base stays on the same origin
    if (parsed.origin !== dummyBase) {
      return fallback;
    }

    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
