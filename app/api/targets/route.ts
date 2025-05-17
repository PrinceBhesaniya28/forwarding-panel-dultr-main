import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// Base API URL with environment variable fallback
const BASE_API_URL = process.env.API_BASE_URL || 'http://68.183.181.86:3000';
const RESET_TARGET_URL = `${BASE_API_URL}/campaigns/reset-target`;

// POST /api/targets/reset - Reset a target
export async function POST(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Get request body
    const body = await request.json();
    
    // Ensure the payload has the correct structure
    const payload = {
      targetId: body.targetId
    };
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const response = await fetch(RESET_TARGET_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error resetting target:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset target' },
      { status: 500 }
    );
  }
} 