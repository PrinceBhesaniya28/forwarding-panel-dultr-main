import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL for credits usage graph endpoint
const API_URL = 'http://68.183.181.86:3000/dashboard/credits-usage-graph-day-wise';

// GET /api/dashboard/credits-usage-graph - Get credits usage graph data with date range
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
    console.log('Fetching credits usage graph data from:', url);
    
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
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Credits usage graph data received:', data);
    
    // Return the data as-is
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching credits usage graph data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch credits usage graph data' },
      { status: 500 }
    );
  }
} 