import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// Base API URL with environment variable fallback
const BASE_API_URL = process.env.API_BASE_URL || 'http://68.183.181.86:3000';
const TARGETS_URL = `${BASE_API_URL}/campaigns/targets`;

// GET /api/targets - Get all targets
export async function GET(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const response = await fetch(TARGETS_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching targets:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch targets' },
      { status: 500 }
    );
  }
}

// POST /api/targets - Create a new target
export async function POST(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Get request body
    const body = await request.json();
    
    // Ensure the payload has the correct structure
    const payload = {
      targetNumber: body.targetNumber,
      campaignId: body.campaignId,
      priority: body.priority || 1,
      dailyCap: body.dailyCap || 1,
      dailyCapValue: body.dailyCapValue,
      concurrency: body.concurrency,
      dialDuration: body.dialDuration || 30,
      assignedTo: body.assignedTo || '' // Add assigned user field
    };
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const response = await fetch(TARGETS_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating target:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create target' },
      { status: 500 }
    );
  }
}

// PUT /api/targets - Update a target
export async function PUT(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Get request body
    const body = await request.json();
    
    // Ensure the payload has the correct structure
    const payload = {
      id: body.id,
      targetNumber: body.targetNumber,
      campaignId: body.campaignId,
      priority: body.priority || 1,
      dailyCap: body.dailyCap || 1,
      dailyCapValue: body.dailyCapValue,
      concurrency: body.concurrency,
      dialDuration: body.dialDuration || 30,
      assignedTo: body.assignedTo || '', // Add assigned user field
      status: body.status
    };
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const response = await fetch(TARGETS_URL, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating target:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update target' },
      { status: 500 }
    );
  }
}

// DELETE /api/targets - Delete a target
export async function DELETE(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    // Get target ID from URL
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('id');
    
    if (!targetId) {
      return NextResponse.json(
        { success: false, message: 'Target ID is required' },
        { status: 400 }
      );
    }
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const response = await fetch(`${TARGETS_URL}/${targetId}`, options);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting target:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete target' },
      { status: 500 }
    );
  }
} 