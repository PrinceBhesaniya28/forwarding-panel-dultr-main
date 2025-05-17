/**
 * API helper functions for making authenticated requests
 */
import { addAuthHeader } from './auth';

/**
 * Generic function to make authenticated fetch requests
 */
export const fetchWithAuth = async <T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> => {
  try {
    // Add auth token to request options
    const authOptions = addAuthHeader(options);
    
    // Make the request
    const response = await fetch(url, authOptions);
    
    // Try to parse response as JSON
    let result;
    try {
      result = await response.json();
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return { 
        success: false, 
        message: 'Invalid response from server' 
      };
    }
    
    // Return a standardized response object
    if (response.ok) {
      return {
        success: true,
        data: result.data || result,
        message: result.message
      };
    } else {
      return {
        success: false,
        message: result.message || `Server responded with status: ${response.status}`
      };
    }
  } catch (error) {
    console.error('Error making API request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error'
    };
  }
};

/**
 * GET request with authentication
 */
export const getWithAuth = <T = any>(url: string): Promise<{ success: boolean; data?: T; message?: string }> => {
  return fetchWithAuth<T>(url, { method: 'GET' });
};

/**
 * POST request with authentication
 */
export const postWithAuth = <T = any, U = any>(
  url: string, 
  data: U
): Promise<{ success: boolean; data?: T; message?: string }> => {
  return fetchWithAuth<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
};

/**
 * PUT request with authentication
 */
export const putWithAuth = <T = any, U = any>(
  url: string, 
  data: U
): Promise<{ success: boolean; data?: T; message?: string }> => {
  return fetchWithAuth<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
};

/**
 * DELETE request with authentication
 */
export const deleteWithAuth = <T = any>(url: string): Promise<{ success: boolean; data?: T; message?: string }> => {
  return fetchWithAuth<T>(url, { method: 'DELETE' });
}; 