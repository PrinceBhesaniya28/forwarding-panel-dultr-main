import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL for hanging up a call
const API_URL = 'http://68.183.181.86:3000/channels/hangup';

// POST /api/calls/hangup - Hang up a call
export async function POST(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Get request body (channel ID)
    const body = await request.json();
    
    if (!body.channel) {
      return NextResponse.json(
        { success: false, message: 'Channel ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Hanging up call on channel:', body.channel);
    console.log('Associated assignedNumber:', body.assignedNumber);
    console.log('Associated targetNumber:', body.targetNumber);
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: body.channel,
        assignedNumber: body.assignedNumber,
        targetNumber: body.targetNumber
      })
    });
    
    const response = await fetch(API_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Hangup response:', data);
    
    // Return the data as-is
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error hanging up call:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to hang up call' },
      { status: 500 }
    );
  }
} 