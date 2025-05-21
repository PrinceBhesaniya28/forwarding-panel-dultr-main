import React, { useEffect, useState } from 'react';
import { getCachedPhoneInfo, type PhoneInfo } from '@/utils/phone-validator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface Props {
  phoneNumber: string;
}

export default function PhoneInfoCell({ phoneNumber }: Props) {
  const [phoneInfo, setPhoneInfo] = useState<PhoneInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhoneInfo() {
      try {
        const info = await getCachedPhoneInfo(phoneNumber);
        setPhoneInfo(info);
      } catch (error) {
        console.error('Error fetching phone info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhoneInfo();
  }, [phoneNumber]);

  if (loading) {
    return <span className="text-gray-500">Loading...</span>;
  }

  if (!phoneInfo) {
    return <span className="text-gray-500">Unknown</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-left">
          <div className="flex flex-col gap-1">
            <span className="font-medium">{phoneInfo.format_national}</span>
            <div className="flex gap-1 flex-wrap">
              {phoneInfo.line_type && (
                <Badge variant="secondary" className="text-xs">
                  {phoneInfo.line_type}
                </Badge>
              )}
              {phoneInfo.is_prepaid && (
                <Badge variant="secondary" className="text-xs">
                  Prepaid
                </Badge>
              )}
              {phoneInfo.is_commercial && (
                <Badge variant="secondary" className="text-xs">
                  Commercial
                </Badge>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <div className="space-y-2">
            <p><strong>Carrier:</strong> {phoneInfo.carrier || 'Unknown'}</p>
            <p><strong>Country Code:</strong> {phoneInfo.country_code || 'Unknown'}</p>
            <p><strong>International Format:</strong> {phoneInfo.format_international}</p>
            <p><strong>SMS Supported:</strong> {phoneInfo.is_sms_supported ? 'Yes' : 'No'}</p>
            {phoneInfo.error && (
              <p className="text-red-500"><strong>Error:</strong> {phoneInfo.error}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 