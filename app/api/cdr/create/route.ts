import { NextResponse } from 'next/server';
import { extractAuthToken, addAuthToRequestOptions } from '@/utils/server-auth';
import { getLineType } from '@/utils/line-type';

// API URL with environment variable fallback
const API_URL = process.env.CDR_API_URL || 'http://68.183.181.86:3000/cdr';
const CAMPAIGNS_URL = process.env.CAMPAIGN_API_URL || 'http://68.183.181.86:3000/campaigns';

// Constants for VOIP handling
const FRAUD_SCORE_THRESHOLD = 75; // Reject calls with fraud score above this
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to mask VOIP number with a real number
async function getMaskedNumber(voipNumber: string, token: string): Promise<string> {
  try {
    // Fetch available numbers from the system
    const numbersResponse = await fetch(`${process.env.NUMBERS_API_URL || 'http://68.183.181.86:3000/phone-numbers'}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!numbersResponse.ok) {
      throw new Error(`Failed to fetch numbers: ${numbersResponse.status}`);
    }

    const numbersResult = await numbersResponse.json();
    const numbers = numbersResult.data || [];

    // Find an available number that's not a VOIP
    const availableNumber = numbers.find((num: any) => 
      num.status === 'available' && 
      !num.is_voip && 
      num.enabled === 1
    );

    if (availableNumber) {
      console.log(`Masking VOIP number ${voipNumber} with ${availableNumber.number}`);
      return availableNumber.number;
    }

    // If no available number found, return original
    console.warn(`No available number found for masking VOIP number ${voipNumber}`);
    return voipNumber;
  } catch (error) {
    console.error('Error getting masked number:', error);
    return voipNumber;
  }
}

// Function to fetch campaigns with retry
async function fetchCampaignsWithRetry(token: string, retries = MAX_RETRIES): Promise<any[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(CAMPAIGNS_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  return [];
}

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
      console.log('VOIP call detected:', {
        number: src,
        lineType: lineTypeInfo.lineType,
        fraudScore: lineTypeInfo.fraudScore,
        recentAbuse: lineTypeInfo.recentAbuse
      });

      // Check fraud score
      if (lineTypeInfo.fraudScore > FRAUD_SCORE_THRESHOLD) {
        console.log(`Rejecting VOIP call due to high fraud score: ${lineTypeInfo.fraudScore}`);
        return NextResponse.json({
          success: false,
          message: 'Call rejected: High fraud score',
          data: {
            src,
            line_type: lineTypeInfo.lineType,
            is_voip: true,
            fraud_score: lineTypeInfo.fraudScore,
            recent_abuse: lineTypeInfo.recentAbuse,
            status: 'REJECTED',
            reason: 'HIGH_FRAUD_SCORE'
          }
        });
      }

      try {
        // Get campaigns with retry mechanism
        const campaigns = await fetchCampaignsWithRetry(token);

        // Find VOIP-specific campaign
        const voipCampaign = campaigns.find((campaign: any) => campaign.voip === true);

        if (voipCampaign) {
          // Get masked number for VOIP call
          const maskedNumber = await getMaskedNumber(src, token);
          
          console.log('Routing VOIP call:', {
            originalNumber: src,
            maskedNumber,
            campaign: voipCampaign.name,
            fraudScore: lineTypeInfo.fraudScore
          });
          
          // Add campaign info and masked number to CDR data
          const cdrData = {
            ...rest,
            src: maskedNumber, // Use masked number
            original_src: src, // Store original number
            line_type: lineTypeInfo.lineType,
            is_voip: lineTypeInfo.isVoip,
            fraud_score: lineTypeInfo.fraudScore,
            recent_abuse: lineTypeInfo.recentAbuse,
            campaign_id: voipCampaign.id,
            campaign_name: voipCampaign.name,
            masked: true
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
        } else {
          // If no VOIP campaign found, reject the call
          console.log('No VOIP campaign found, rejecting call');
          return NextResponse.json({
            success: false,
            message: 'Call rejected: VOIP calls not allowed',
            data: {
              src,
              line_type: lineTypeInfo.lineType,
              is_voip: true,
              fraud_score: lineTypeInfo.fraudScore,
              recent_abuse: lineTypeInfo.recentAbuse,
              status: 'REJECTED',
              reason: 'VOIP_CALL'
            }
          });
        }
      } catch (error) {
        console.error('Error handling VOIP call:', error);
        // If there's an error in VOIP handling, reject the call
        return NextResponse.json({
          success: false,
          message: 'Call rejected: Error in VOIP handling',
          data: {
            src,
            line_type: lineTypeInfo.lineType,
            is_voip: true,
            fraud_score: lineTypeInfo.fraudScore,
            recent_abuse: lineTypeInfo.recentAbuse,
            status: 'REJECTED',
            reason: 'VOIP_HANDLING_ERROR'
          }
        });
      }
    }

    // For non-VOIP calls, proceed normally
    const cdrData = {
      ...rest,
      src,
      line_type: lineTypeInfo.lineType,
      is_voip: lineTypeInfo.isVoip,
      fraud_score: lineTypeInfo.fraudScore,
      recent_abuse: lineTypeInfo.recentAbuse,
      masked: false
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