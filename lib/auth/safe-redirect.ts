/** Reject protocol-relative and absolute URLs; only allow same-site paths. */
export function safeRedirectPath(
  path: string | null | undefined,
  fallback: string,
  options?: { adminOnly?: boolean }
): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return fallback;
  }
  if (options?.adminOnly && !path.startsWith('/admin')) {
    return fallback;
  }
  return path;
}
