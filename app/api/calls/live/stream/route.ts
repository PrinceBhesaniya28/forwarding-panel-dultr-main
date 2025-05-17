import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

const API_URL = 'http://68.183.181.86:3000/live-calls/calls';
const POLLING_INTERVAL = 5000; // 5 seconds

// Store the last response and timestamp
let lastResponse: any = null;
let lastFetchTime: number = 0;

// GET /api/calls/live/stream - Get live calls with server-side polling
export async function GET(request: Request) {
  try {
    const currentTime = Date.now();
    
    // Only fetch new data if enough time has passed since the last fetch
    if (currentTime - lastFetchTime >= POLLING_INTERVAL) {
      const token = extractAuthToken(request);
      
      const options = addAuthToRequestOptions(token, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      const response = await fetch(API_URL, options);
      
      if (!response.ok) {
        throw new Error(`Backend API responded with status: ${response.status}`);
      }
      
      lastResponse = await response.json();
      lastFetchTime = currentTime;
    }
    
    // Return the cached or fresh response
    return NextResponse.json(lastResponse);
  } catch (error) {
    console.error('Error in live calls stream:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch live calls' },
      { status: 500 }
    );
  }
} 