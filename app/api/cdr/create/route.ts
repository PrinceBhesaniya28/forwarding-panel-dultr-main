import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';
import { getLineType } from '@/utils/line-type';

// API URL with environment variable fallback
const API_URL = process.env.CDR_API_URL || 'http://68.183.181.86:3000/cdr';

// POST /api/cdr/create - Create new CDR record
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { src, ...rest } = body;

    // Extract auth token from request
    const token = extractAuthToken(request);

    // Fetch line type BEFORE creating CDR
    const lineTypeInfo = await getLineType(src);

    // Handle VOIP calls before they land
    if (lineTypeInfo.isVoip) {
      // TODO: Implement VOIP handling logic
      // 1. Route to separate target/campaign
      // 2. Mask with real number
      // 3. Reject call
      console.log('VOIP call detected:', {
        number: src,
        fraudScore: lineTypeInfo.fraudScore,
        recentAbuse: lineTypeInfo.recentAbuse
      });

      // For now, we'll just store the VOIP status
      // In the future, this is where we'll implement the VOIP handling logic
    }

    // Add line type info to the CDR data
    const cdrData = {
      ...rest,
      src,
      line_type: lineTypeInfo.lineType,
      is_voip: lineTypeInfo.isVoip,
      fraud_score: lineTypeInfo.fraudScore,
      recent_abuse: lineTypeInfo.recentAbuse
    };

    // Add auth token to request options
    const options = addAuthToRequestOptions(token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cdrData)
    });

    const response = await fetch(`${API_URL}/create`, options);

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating CDR record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create CDR record' },
      { status: 500 }
    );
  }
} 