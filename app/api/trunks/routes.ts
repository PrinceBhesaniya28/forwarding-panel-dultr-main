import { NextResponse } from 'next/server';

const API_URL = 'http://192.168.90.51:3000/trunks';

// GET /api/trunks - Get all trunks
export async function GET() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to fetch trunks');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trunks' },
      { status: 500 }
    );
  }
}

// POST /api/trunks - Create a new trunk
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.trunkName || !body.serverIp || !body.username || !body.secret) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payload = {
      trunkName: body.trunkName,
      serverIp: body.serverIp,
      username: body.username,
      secret: body.secret,
      ipAuth: body.ipAuth,
      status: body.status,
      prefix: body.prefix || ''
    };

    console.log('Payload for creating trunk:', payload);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to create trunk');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error creating trunk:', error);
    return NextResponse.json(
      { error: 'Failed to create trunk' },
      { status: 500 }
    );
  }
}

// PUT /api/trunks - Update a trunk
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Trunk ID is required' },
        { status: 400 }
      );
    }

    const payload = {
      id: body.id,
      trunkName: body.trunkName,
      serverIp: body.serverIp,
      username: body.username,
      secret: body.secret,
      ipAuth: body.ipAuth,
      status: body.status,
      prefix: body.prefix || ''
    };

    console.log('Payload for updating trunk:', payload);
    
    const response = await fetch(`${API_URL}/${body.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to update trunk');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error updating trunk:', error);
    return NextResponse.json(
      { error: 'Failed to update trunk' },
      { status: 500 }
    );
  }
}

// DELETE /api/trunks/{id} - Delete a trunk
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Trunk ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to delete trunk');
    }

    return NextResponse.json(
      { message: 'Trunk deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete trunk' },
      { status: 500 }
    );
  }
} 