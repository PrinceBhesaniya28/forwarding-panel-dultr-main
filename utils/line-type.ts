const IPQUALITYSCORE_API_KEY = 'iJ0xwvNFu14hn5Z6NIISK61TCq6iJZ7R';

export async function getLineType(phoneNumber: string): Promise<{
  lineType: string;
  isVoip: boolean;
  fraudScore: number;
  recentAbuse: boolean;
}> {
  try {
    // Remove any non-numeric characters from the phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (!cleanNumber) {
      console.warn('Invalid phone number provided:', phoneNumber);
      return {
        lineType: 'invalid',
        isVoip: false,
        fraudScore: 0,
        recentAbuse: false
      };
    }
    
    const response = await fetch(
      `https://www.ipqualityscore.com/api/json/phone/${IPQUALITYSCORE_API_KEY}/${cleanNumber}?strictness=1`
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
          number: cleanNumber,
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
  // Check if we have a cached result
  if (lineTypeCache.has(phoneNumber)) {
    return lineTypeCache.get(phoneNumber)!;
  }
  
  // Fetch new result
  const result = await getLineType(phoneNumber);
  
  // Cache the result
  lineTypeCache.set(phoneNumber, result);
  
  return result;
} 