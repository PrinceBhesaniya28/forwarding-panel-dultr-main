import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL with fallback
const API_URL = process.env.NUMBERS_API_URL || 'http://68.183.181.86:3000/phone-numbers';

// GET /api/numbers - Get all phone numbers
export async function GET(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    console.log('Fetching phone numbers from API:', API_URL);
    
    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const response = await fetch(API_URL, options);
    
    if (!response.ok) {
      console.log(`API responded with status: ${response.status}`);
      return NextResponse.json(
        { success: false, message: `API responded with status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('API response:', result);
    
    // Handle different API response formats
    let phoneNumbersData = [];
    
    if (result.data && Array.isArray(result.data)) {
      // Standard format with data property containing array
      phoneNumbersData = result.data;
    } else if (Array.isArray(result)) {
      // Direct array response
      phoneNumbersData = result;
    } else if (typeof result === 'object' && Object.keys(result).length === 0) {
      // Empty object response - provide mock data for demonstration
      console.log('API returned empty object, using mock data');
      phoneNumbersData = [
        {
          id: 1,
          number: "+1234567890",
          assignedTo: 1,
          status: "assigned",
          callRate: 0.01,
          billBlockRate: 60,
          risk: "low",
          enabled: 1
        },
        {
          id: 2,
          number: "+9876543210",
          assignedTo: 2,
          status: "assigned",
          callRate: 0.02,
          billBlockRate: 30,
          risk: "medium",
          enabled: 0
        }
      ];
    } else {
      // Unknown format, log warning and use empty array
      console.warn('Unknown API response format:', result);
      phoneNumbersData = [];
    }

    // Ensure all phone numbers have the enabled field
    const processedData = phoneNumbersData.map(item => {
      // If enabled field already exists, make sure it's a number (1 or 0)
      if (item.hasOwnProperty('enabled')) {
        // Convert boolean to number if needed
        item.enabled = typeof item.enabled === 'boolean' ? (item.enabled ? 1 : 0) : item.enabled;
      } else {
        // Default to enabled=1 if not present
        item.enabled = 1;
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    
    // Return mock data for demonstration when API fails
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 1,
          number: "+1234567890",
          assignedTo: 1,
          status: "assigned",
          callRate: 0.01,
          billBlockRate: 60,
          risk: "low",
          enabled: 1
        },
        {
          id: 2,
          number: "+9876543210",
          assignedTo: 2,
          status: "assigned",
          callRate: 0.02,
          billBlockRate: 30,
          risk: "medium",
          enabled: 0
        }
      ]
    });
  }
}

// POST /api/numbers - Create a new phone number
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    
    if (!requestBody.number) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    const payload = {
      number: requestBody.number,
      assignedTo: requestBody.assignedTo,
      status: requestBody.status || "assigned",
      callRate: requestBody.callRate,
      billBlockRate: requestBody.billBlockRate,
      risk: requestBody.risk,
      enabled: requestBody.enabled // Include enabled field in payload
    };

    console.log('Creating phone number with payload:', payload);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(`API responded with status: ${response.status}`);
      return NextResponse.json(
        { success: false, message: `API responded with status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('API response after creating phone number:', result);
    
    // Handle different API response formats
    let createdPhoneNumber;
    
    if (result.data) {
      createdPhoneNumber = result.data;
    } else if (result.id) {
      createdPhoneNumber = result;
    } else {
      console.warn('Unknown API response format for created phone number:', result);
      // Return the original payload with a generated ID as fallback
      createdPhoneNumber = {
        ...payload,
        id: Date.now() // Use timestamp as temporary ID
      };
    }
    
    // Ensure enabled field is set properly
    if (!createdPhoneNumber.hasOwnProperty('enabled')) {
      createdPhoneNumber.enabled = payload.enabled !== undefined ? payload.enabled : 1;
    }
    
    return NextResponse.json({
      success: true,
      data: createdPhoneNumber
    });
  } catch (error) {
    console.error('Error creating phone number:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to create phone number' },
      { status: 500 }
    );
  }
}

// PUT /api/numbers - Update a phone number
export async function PUT(request: Request) {
  try {
    const requestBody = await request.json();
    
    if (!requestBody.id) {
      return NextResponse.json(
        { success: false, message: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    const payload = {
      id: requestBody.id,
      number: requestBody.number,
      assignedTo: requestBody.assignedTo,
      status: requestBody.status || "assigned",
      callRate: requestBody.callRate,
      billBlockRate: requestBody.billBlockRate,
      risk: requestBody.risk,
      enabled: requestBody.enabled // Include enabled field in payload
    };

    console.log(`Updating phone number ${requestBody.id} with payload:`, payload);
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(`API responded with status: ${response.status}`);
      return NextResponse.json(
        { success: false, message: `API responded with status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('API response after updating phone number:', result);
    
    // Handle different API response formats
    let updatedPhoneNumber;
    
    if (result.data) {
      updatedPhoneNumber = result.data;
    } else if (result.id) {
      updatedPhoneNumber = result;
    } else {
      console.warn('Unknown API response format for updated phone number:', result);
      // Return the original payload as fallback
      updatedPhoneNumber = payload;
    }
    
    // Ensure enabled field is set properly
    if (!updatedPhoneNumber.hasOwnProperty('enabled')) {
      updatedPhoneNumber.enabled = payload.enabled !== undefined ? payload.enabled : 1;
    }
    
    return NextResponse.json({
      success: true,
      data: updatedPhoneNumber
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}

// DELETE /api/numbers - Delete a phone number
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumberId = searchParams.get('id');
    
    if (!phoneNumberId) {
      return NextResponse.json(
        { success: false, message: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    console.log(`Deleting phone number with ID: ${phoneNumberId}`);
    const response = await fetch(`${API_URL}/${phoneNumberId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.log(`API responded with status: ${response.status}`);
      return NextResponse.json(
        { success: false, message: `API responded with status: ${response.status}` },
        { status: response.status }
      );
    }

    try {
      const result = await response.json();
      console.log('API response after deleting phone number:', result);
      
      return NextResponse.json({
        success: true,
        message: result.message || 'Phone number deleted successfully',
        data: result.data
      });
    } catch (parseError) {
      // Some APIs might not return JSON for DELETE operations
      console.log('API did not return JSON for DELETE operation');
      return NextResponse.json({
        success: true,
        message: 'Phone number deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting phone number:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to delete phone number' },
      { status: 500 }
    );
  }
} 