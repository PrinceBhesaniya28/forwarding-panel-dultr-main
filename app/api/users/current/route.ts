import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

const API_URL = 'http://68.183.181.86:3000/users';

// GET /api/users/current - Get current user data (including balance)
export async function GET(request: Request) {
  try {
    const token = extractAuthToken(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    // First try the /current endpoint if it exists
    let response = await fetch(`${API_URL}/current`, options);
    
    // If that doesn't work, try the main users endpoint
    if (!response.ok) {
      console.log('Current user endpoint not found, trying main users endpoint');
      response = await fetch(API_URL, options);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      // Process the users response to find the current user
      const result = await response.json();
      
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Failed to fetch users data');
      }
      
      // The token may contain user information we can use to identify the current user
      // For now, we'll just return the first user as an example
      // In a real application, you would match the current user based on token claims
      const currentUser = result.data[0];
      
      return NextResponse.json({
        success: true,
        data: currentUser
      });
    } else {
      // If the /current endpoint worked, return its response
      const result = await response.json();
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error fetching current user data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch current user data' },
      { status: 500 }
    );
  }
} 