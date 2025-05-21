const IPQUALITYSCORE_API_KEY = 'iJ0xwvNFu14hn5Z6NIISK61TCq6iJZ7R';
const IPQUALITYSCORE_API_URL = 'https://www.ipqualityscore.com/api/json/phone';

export interface PhoneInfo {
  valid: boolean;
  format_national: string;
  format_international: string;
  country_code: string;
  line_type: string;
  carrier: string;
  is_prepaid: boolean;
  is_commercial: boolean;
  is_sms_supported: boolean;
  error?: string;
}

export async function getPhoneInfo(phoneNumber: string): Promise<PhoneInfo> {
  try {
    const response = await fetch(
      `${IPQUALITYSCORE_API_URL}/${IPQUALITYSCORE_API_KEY}/${phoneNumber}?strictness=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching phone info:', error);
    return {
      valid: false,
      format_national: phoneNumber,
      format_international: phoneNumber,
      country_code: '',
      line_type: 'Unknown',
      carrier: 'Unknown',
      is_prepaid: false,
      is_commercial: false,
      is_sms_supported: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Cache for phone information to avoid repeated API calls
const phoneInfoCache = new Map<string, PhoneInfo>();

export async function getCachedPhoneInfo(phoneNumber: string): Promise<PhoneInfo> {
  // Check if we have cached data
  if (phoneInfoCache.has(phoneNumber)) {
    return phoneInfoCache.get(phoneNumber)!;
  }

  // Fetch new data
  const phoneInfo = await getPhoneInfo(phoneNumber);
  
  // Cache the result
  phoneInfoCache.set(phoneNumber, phoneInfo);
  
  return phoneInfo;
} 