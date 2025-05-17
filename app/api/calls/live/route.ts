import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL for live calls endpoint
const API_URL = 'http://68.183.181.86:3000/live-calls/calls';

// GET /api/calls/live - Get live calls
export async function GET(request: Request) {
  try {
    console.log('Fetching live calls from:', API_URL);
    
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Ensure we don't cache the response
    });
    
    const response = await fetch(API_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Live calls data received, count:', data.data?.length || 0);
    
    // Return the data as-is
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching live calls:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch live calls' },
      { status: 500 }
    );
  }
} 