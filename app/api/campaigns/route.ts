import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

const API_URL = process.env.CAMPAIGN_API_URL || 'http://68.183.181.86:3000/campaigns';

// GET /api/campaigns - Get all campaigns
export async function GET(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);

    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await fetch(API_URL, options);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch campaigns');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    if (!token) {
      console.error('No authentication token found in request');
      return NextResponse.json(
        { success: false, message: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body);

    if (!body.name || !body.assignedNumber) {
      console.error('Missing required fields:', { name: body.name, assignedNumber: body.assignedNumber });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payload = {
      name: body.name,
      assignedNumber: body.assignedNumber,
      createdBy: body.createdBy,
      targets: body.targets || [],
      type: body.type || 'roundrobin',
      status: body.status !== undefined ? body.status : true,
      voip: body.voip !== undefined ? body.voip : true
    };

    console.log('API Route - Received POST request for new campaign');
    console.log('API Route - Sending request to:', API_URL);
    console.log('API Route - Request payload:', JSON.stringify(payload));

    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('API Route - Request options:', {
      method: options.method,
      headers: options.headers,
      body: options.body
    });

    const response = await fetch(API_URL, options);
    console.log('API Route - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Route - Backend error response:', errorText);
      throw new Error(`API responded with status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Route - Backend response:', result);


    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating campaign:', error);
    // Return a more detailed error response
    return NextResponse.json(
      {
        success: false,
        message: `Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns - Update a campaign
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    console.log('API Route - Received PUT request for campaign ID:', body.id);

    // Remove createdAt from both the campaign object and the targets
    const { createdAt, ...campaignWithoutCreatedAt } = body;

    const cleanedBody = {
      ...campaignWithoutCreatedAt,
      targets:
        body.targets?.map((target: any) => {
          // Create a new object without createdAt from each target
          const { createdAt, ...cleanedTarget } = target;
          return cleanedTarget;
        }) || [],
      type: body.type || 'roundrobin',
      status: body.status !== undefined ? body.status : true
    };

    // Modify the URL to match the expected backend format
    const updateUrl = API_URL;

    console.log('API Route - Sending request to:', updateUrl);
    delete cleanedBody.createDt;
    cleanedBody.targets.forEach((target: any) => {
      delete target.daily;
    });

    console.log('API Route - Request payload:', JSON.stringify(cleanedBody));
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanedBody)
    });

    if (!response.ok) {
      console.error(
        `API Route - Backend responded with status: ${response.status}`
      );
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Route - Backend response:', result);

    if (!result.success) {
      throw new Error(result.message || 'Failed to update campaign');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to update campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns?id={id} - Delete a campaign
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    console.log('API Route - Received DELETE request for campaign ID:', id);

    // Change back to original path format
    const deleteUrl = `${API_URL}/${id}`;

    console.log('API Route - Sending request to:', deleteUrl);

    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });

    if (!response.ok) {
      console.error(
        `API Route - Backend responded with status: ${response.status}`
      );
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Route - Backend response:', result);

    if (!result.success) {
      throw new Error(result.message || 'Failed to delete campaign');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to delete campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}
