import { addAuthToRequestOptions } from '@/utils/server-auth';
import { NextResponse } from 'next/server';

const API_URL = 'http://68.183.181.86:3000/users';

export async function GET(request: Request) {
  try {
    // Get the auth token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid Authorization header found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Making request to backend API:', API_URL);

    // Make request to backend API
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    console.log('Request options:', {
      method: options.method,
      headers: options.headers,
      url: API_URL
    });

    const response = await fetch(API_URL, options);
    console.log('Backend API response status:', response.status);

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Backend API response data:', result);

    // Handle both array and object response formats
    let users = [];
    if (Array.isArray(result)) {
      users = result;
    } else if (result.data && Array.isArray(result.data)) {
      users = result.data;
    } else if (result.success && Array.isArray(result.data)) {
      users = result.data;
    } else {
      console.error('Invalid response format:', result);
      throw new Error('Failed to fetch users data');
    }

    // Return the list of users
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 