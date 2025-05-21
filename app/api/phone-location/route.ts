import { NextResponse } from 'next/server';

const IPQUALITYSCORE_API_KEY = 'iJ0xwvNFu14hn5Z6NIISK61TCq6iJZ7R';
const IPQUALITYSCORE_API_URL = 'https://www.ipqualityscore.com/api/json/phone';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${IPQUALITYSCORE_API_URL}/${IPQUALITYSCORE_API_KEY}/${phoneNumber}?strictness=1`
    );

    if (!response.ok) {
      throw new Error(`IPQualityScore API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching phone location:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch phone location' },
      { status: 500 }
    );
  }
} 