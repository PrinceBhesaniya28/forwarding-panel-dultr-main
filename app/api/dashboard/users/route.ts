import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL for the user count endpoint
const API_URL = 'http://68.183.181.86:3000/dashboard/users';

// GET /api/dashboard/users - Get total user count
export async function GET(request: Request) {
  try {
    //console.log('Fetching user count from:', API_URL);
    
    const token = extractAuthToken(request);
    console.log('Extracted auth token:', token);
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const response = await fetch(API_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    //console.log('User count data:', data);
    
    // Return the data as-is
    return NextResponse.json(data);
  } catch (error) {
    //console.error('Error fetching user count:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user count' },
      { status: 500 }
    );
  }
} 