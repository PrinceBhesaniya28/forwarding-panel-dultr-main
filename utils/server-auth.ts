/**
 * Utility functions for handling authentication on the server side
 */

/**
 * Extract the authentication token from the request headers
 * @param request The incoming request
 * @returns The extracted token or null if not found
 */
export const extractAuthToken = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Extract the token part after "Bearer "
  return authHeader.substring(7);
};

/**
 * Add the authorization header to request options for backend API calls
 * @param token The authentication token
 * @param options The fetch options to enhance
 * @returns Enhanced fetch options with auth header
 */
export const addAuthToRequestOptions = (
  token: string | null, 
  options: RequestInit = {}
): RequestInit => {
  if (!token) {
    return options;
  }
  
  // Create new headers object with existing headers plus auth header
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  return {
    ...options,
    headers
  };
}; 