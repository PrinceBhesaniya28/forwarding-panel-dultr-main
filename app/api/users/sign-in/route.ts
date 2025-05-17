import { NextResponse } from 'next/server';

// API URL pointing to the backend authentication service
const API_URL = 'http://68.183.181.86:3000/users/sign-in';

// Handle POST requests to /api/users/sign-in
export async function POST(request: Request) {
  console.log('🔥 /api/users/sign-in API route called');
  
  try {
    console.log('💬 Parsing request body');
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    // Validate request body
    if (!body.email || !body.password) {
      console.log('❌ Validation failed: Missing email or password');
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log(`📧 Attempting to sign in user with email: ${body.email}`);
    
    // Forward the authentication request to the backend service
    console.log(`🌐 Sending request to backend: ${API_URL}`);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    console.log(`🔄 Backend response status: ${response.status}`);
    console.log(`🔄 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    // Try to parse JSON response, with error handling
    let result;
    try {
      console.log('🔄 Attempting to parse response as JSON');
      result = await response.json();
      console.log('✅ Raw response from backend:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid response from authentication server' },
        { status: 500 }
      );
    }
    
    // Check if the backend request was successful
    if (response.ok) {
      // Check if the response indicates success
      if (result.success === true || result.token) {
        console.log('✅ Authentication successful');
        // Return the success response with user data and token
        return NextResponse.json({
          success: true,
          data: result.data,
          token: result.token,
          message: 'Sign in successful'
        });
      } else {
        console.log('❌ Backend returned success status but no token or success flag');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Authentication failed: Invalid credentials' 
          },
          { status: 401 }
        );
      }
    } else {
      console.log('❌ Authentication failed with error:', result.message || 'Unknown error');
      // If the backend request failed, return the error message
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Invalid email or password' 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('❌ Error during sign in:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during sign in' },
      { status: 500 }
    );
  }
} 