import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL with environment variable fallback
const API_URL = process.env.LIVE_CALLS_API_URL || 'http://68.183.181.86:3000/live-calls/calls';

// GET /api/live-calls - Get live calls
export async function GET(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    console.log(`Fetching live calls from: ${API_URL}`);
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const response = await fetch(API_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Pass through the backend response exactly as received
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching live calls:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch live calls' },
      { status: 500 }
    );
  }
} 