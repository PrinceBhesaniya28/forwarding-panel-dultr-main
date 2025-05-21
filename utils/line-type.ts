const IPQUALITYSCORE_API_KEY = 'iJ0xwvNFu14hn5Z6NIISK61TCq6iJZ7R';

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

export async function getLineType(phoneNumber: string): Promise<{
  lineType: string;
  isVoip: boolean;
  fraudScore: number;
  recentAbuse: boolean;
}> {
  try {
    // Format phone number to E.164 format
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    if (!formattedNumber || formattedNumber === '+') {
      console.warn('Invalid phone number provided:', phoneNumber);
      return {
        lineType: 'invalid',
        isVoip: false,
        fraudScore: 0,
        recentAbuse: false
      };
    }
    
    console.log('Fetching line type for:', formattedNumber);
    const response = await fetch(
      `https://www.ipqualityscore.com/api/json/phone/${IPQUALITYSCORE_API_KEY}/${formattedNumber}?strictness=1`
    );
    
    if (!response.ok) {
      console.error('IPQualityScore API error:', response.status, response.statusText);
      return {
        lineType: 'error',
        isVoip: false,
        fraudScore: 0,
        recentAbuse: false
      };
    }
    
    const data = await response.json();
    console.log('IPQualityScore API response:', data);
    
    if (data.success) {
      const result = {
        lineType: data.line_type || 'unknown',
        isVoip: data.VOIP || false,
        fraudScore: data.fraud_score || 0,
        recentAbuse: data.recent_abuse || false
      };
      
      // Log VOIP detection
      if (result.isVoip) {
        console.log('VOIP detected:', {
          number: formattedNumber,
          lineType: result.lineType,
          fraudScore: result.fraudScore,
          recentAbuse: result.recentAbuse
        });
      }
      
      return result;
    }
    
    console.warn('IPQualityScore API returned unsuccessful response:', data);
    return {
      lineType: 'unknown',
      isVoip: false,
      fraudScore: 0,
      recentAbuse: false
    };
  } catch (error) {
    console.error('Error fetching line type:', error);
    return {
      lineType: 'error',
      isVoip: false,
      fraudScore: 0,
      recentAbuse: false
    };
  }
}

// Cache for line types to avoid repeated API calls
const lineTypeCache = new Map<string, {
  lineType: string;
  isVoip: boolean;
  fraudScore: number;
  recentAbuse: boolean;
}>();

export async function getCachedLineType(phoneNumber: string): Promise<{
  lineType: string;
  isVoip: boolean;
  fraudScore: number;
  recentAbuse: boolean;
}> {
  // Format phone number to E.164 format for cache key
  const formattedNumber = formatPhoneNumber(phoneNumber);
  
  // Check if we have a cached result
  if (lineTypeCache.has(formattedNumber)) {
    return lineTypeCache.get(formattedNumber)!;
  }
  
  // Fetch new result
  const result = await getLineType(phoneNumber);
  
  // Cache the result
  lineTypeCache.set(formattedNumber, result);
  
  return result;
} 