/**
 * Extracts the auth token from the request headers
 * @param request The incoming request
 * @returns The auth token if present, null otherwise
 */
export function extractAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  return token || null;
}

/**
 * Adds the auth token to the request options
 * @param options The request options to modify
 * @param token The auth token to add
 * @returns The modified request options with auth token
 */
export function addAuthToRequestOptions(options: RequestInit, token: string | null): RequestInit {
  if (!token) return options;
  
  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
} 