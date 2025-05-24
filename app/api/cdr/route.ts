import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL with environment variable fallback
const API_URL = process.env.CDR_API_URL || 'http://68.183.181.86:3000/cdr';

// GET /api/cdr - Get CDR records with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Just forward all query parameters directly to the backend
    // This ensures we don't add any parameters that the backend doesn't support
    const queryString = searchParams.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;
    
    console.log(`Fetching from: ${url}`);
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure we don't cache the response
    });
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('CDR API response:', result);
    
    // Ensure user email is included in the response
    if (result.success && Array.isArray(result.data)) {
      console.log('Total records received:', result.data.length);
      result.data = result.data.map((record: any) => ({
        ...record,
        userEmail: record.userEmail || record.email || record.user?.email || null,
        email: record.userEmail || record.email || record.user?.email || null
      }));
    }
    
    // Pass through the backend response
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching CDR records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch CDR records' },
      { status: 500 }
    );
  }
}
