import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL for call record graph endpoint
const API_URL = 'http://68.183.181.86:3000/dashboard/call-record-graph-detailed';

// GET /api/dashboard/call-record-graph - Get call record graph data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build the query string with date range parameters if provided
    let queryString = '';
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      queryString = `?${params.toString()}`;
    }
    
    const url = `${API_URL}${queryString}`;
    console.log('Fetching call record graph data from:', url);
    
    // Log request headers
    console.log('Incoming request headers:', Object.fromEntries(request.headers));
    
    // Extract auth token from request
    const token = extractAuthToken(request);
    console.log('Extracted auth token:', token);
    
    if (!token) {
      console.log('No auth token found in request');
    }
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Request options with auth:', JSON.stringify(options, null, 2));
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Call record graph data received:', data);
    
    // Return the data as-is
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching call record graph data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch call record graph data' },
      { status: 500 }
    );
  }
} 