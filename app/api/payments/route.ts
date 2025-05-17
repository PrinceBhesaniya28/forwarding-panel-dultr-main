import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';

// API URL with fallback
const API_URL = process.env.PAYMENT_API_URL || 'http://68.183.181.86:3000/payments';

// In-memory cache to store payments between requests
// NOTE: This is a temporary solution until the real API is working correctly
let mockPayments = [
  {
    id: 1,
    userId: 1, 
    phoneNumberId: 1,
    amount: 500,
    status: "pending",
    transactionId: "txn_123456"
  }
];

// GET /api/payments - Get all payments
export async function GET(request: Request) {
  try {
    // Extract auth token from request
    const token = extractAuthToken(request);
    
    console.log('Fetching payments from API:', API_URL);
    
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
    
    // Transform the data to match the expected format in the frontend if needed
    const transformedPayments = result.data && Array.isArray(result.data) 
      ? result.data.map((payment: any) => ({
          id: payment.id,
          userId: payment.userId,
          phoneNumberId: payment.phoneNumberId,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
          user: payment.user
        }))
      : [];

    // Return in the same format as other APIs with success flag
    return NextResponse.json({
      success: true,
      data: transformedPayments.length > 0 ? transformedPayments : result.data || []
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    
    // Return mock data for demonstration when API fails
    return NextResponse.json({
      success: true,
      data: mockPayments
    });
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.userId || !body.amount || !body.status || !body.transactionId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: body.userId,
        amount: body.amount,
        status: body.status,
        transactionId: body.transactionId
      }),
    });

    const result = await response.json();
    console.log(result);
    if (!result.success) {
      throw new Error('Failed to update payment');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating payment:', error);
  }
}

// PUT /api/payments - Update a payment
export async function PUT(request: Request) {
  let requestBody;
  try {
    requestBody = await request.json();
    
    if (!requestBody.id) {
      return NextResponse.json(
        { success: false, message: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: requestBody.id,
        userId: requestBody.userId,
        amount: requestBody.amount,
        status: requestBody.status,
        transactionId: requestBody.transactionId
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to update payment');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating payment:', error);
  }
}

// DELETE /api/payments - Delete a payment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to delete payment');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting payment:', error);
    
    // Return mock success for demonstration purposes
    // return NextResponse.json({ 
    //   success: true,
    //   message: 'Payment deleted successfully'
    // });
  }
} 