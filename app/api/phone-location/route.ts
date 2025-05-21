import { NextResponse } from 'next/server';

const IPQUALITYSCORE_API_KEY = 'iJ0xwvNFu14hn5Z6NIISK61TCq6iJZ7R';
const IPQUALITYSCORE_API_URL = 'https://www.ipqualityscore.com/api/json/phone';

// Format phone number to E.164 format
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 1 and is 11 digits, add + prefix
  if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
    return `+${cleanNumber}`;
  }
  
  // If number is 10 digits, assume it's a US number and add +1
  if (cleanNumber.length === 10) {
    return `+1${cleanNumber}`;
  }
  
  // If number already has + prefix, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // For other cases, add + prefix
  return `+${cleanNumber}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    
    if (!phoneNumber) {
      console.error('No phone number provided');
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format the phone number to E.164 format
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log('Original phone number:', phoneNumber);
    console.log('Formatted phone number:', formattedNumber);

    if (!formattedNumber || formattedNumber === '+') {
      console.error('Invalid phone number after formatting:', phoneNumber);
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const apiUrl = `${IPQUALITYSCORE_API_URL}/${IPQUALITYSCORE_API_KEY}/${formattedNumber}?strictness=1`;
    console.log('Calling IPQualityScore API:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('IPQualityScore API error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl
      });
      return NextResponse.json(
        { success: false, message: 'Failed to fetch phone location' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('IPQualityScore API raw response:', data);

    // Check if we have the required fields
    if (!data.success) {
      console.warn('IPQualityScore API returned unsuccessful response:', data);
      return NextResponse.json(
        { success: false, message: 'Invalid response from location service' },
        { status: 500 }
      );
    }

    // Extract location data
    const locationData = {
      success: true,
      city: data.city || 'Unknown',
      region_code: data.region_code || 'Unknown',
      country: data.country || 'US',
      timezone: data.timezone || 'America/New_York'
    };

    console.log('Processed location data:', locationData);
    return NextResponse.json(locationData);
  } catch (error) {
    console.error('Error fetching phone location:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch phone location' },
      { status: 500 }
    );
  }
} 