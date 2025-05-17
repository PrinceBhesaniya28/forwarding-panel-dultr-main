import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL for credits used endpoint
const API_URL = 'http://68.183.181.86:3000/dashboard/credits-used';

// GET /api/dashboard/credits-used - Get total credits used
export async function GET(request: Request) {
  try {
    console.log('Fetching credits used from:', API_URL);
    
    // Extract auth token from request
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
    console.log('Credits used data:', data);
    
    // Return the data as-is
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching credits used:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch credits used' },
      { status: 500 }
    );
  }
} 