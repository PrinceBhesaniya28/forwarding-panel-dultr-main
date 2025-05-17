// Auth token management utilities

// Constants
const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Store authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Store user data in localStorage
 */
export const setUserData = (userData: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
};

/**
 * Get the stored authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Get the stored user data
 */
export const getUserData = (): any | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

/**
 * Clear authentication data (logout)
 */
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem('userRole');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Add authentication header to fetch options
 */
export const addAuthHeader = (options: RequestInit = {}): RequestInit => {
  const token = getAuthToken();
  
  if (!token) {
    return options;
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  return {
    ...options,
    headers
  };
};

/**
 * Get the user role
 */
export const getUserRole = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userRole');
  }
  return null;
}; 