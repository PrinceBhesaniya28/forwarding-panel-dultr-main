import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SearchModal } from './Modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { HiMagnifyingGlass, HiMagnifyingGlassPlus, HiArrowDownTray } from 'react-icons/hi2';
import { getWithAuth } from '@/utils/api-helpers';

// Match the exact data structure from the backend
export type CdrRecord = {
  calldate: string;
  clid: string;
  src: string;
  dst: string;
  dcontext: string;
  channel: string;
  dstchannel: string;
  lastapp: string;
  lastdata: string;
  duration: number;
  billsec: number;
  disposition: string;
  amaflags: number;
  accountcode: string;
  userfield: string;
  uniqueid: string;
  userName: string | null;
  userEmail: string | null;
  userid: number | null;
  ringingTime: number;
  campaignNumber: string | null;
  campaignName: string | null;
  targetNumber: string | null;
  callDisposition: string | null;
  identity: string | null;
  callerFrom: string | null;
  lineType: string | null;
};

// Format duration in seconds to a readable format
function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedMinutes}:${formattedSeconds}`;
}

export default function CdrListTable(props: { refreshData: () => void }) {
  const { toast } = useToast();
  const [records, setRecords] = useState<CdrRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [callerLocations, setCallerLocations] = useState<Record<string, string>>({});
  const recordsPerPage = 10;

  // Fetch caller location information
  const fetchCallerLocation = async (phoneNumber: string) => {
    if (callerLocations[phoneNumber]) return callerLocations[phoneNumber];
    
    try {
      console.log('Fetching location for:', phoneNumber);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`/api/phone-location?phone=${phoneNumber}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Location API response:', data);
      
      if (data && data.success) {
        const location = `${data.city.toUpperCase()}, ${data.region_code}`;
        setCallerLocations(prev => ({...prev, [phoneNumber]: location}));
        return location;
      }
      return 'Location Unknown';
    } catch (error) {
      console.error('Error fetching caller location:', error);
      return 'Location Unknown';
    }
  };

  // Fetch CDR records with filtering
  const fetchRecords = useCallback(
    async (filters = searchParams) => {
      setIsLoading(true);
      try {
        // Build query parameters for backend
        const params = new URLSearchParams();

        // Add advanced search filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            // Convert userId to userid if present
            const paramKey = key === 'userId' ? 'userid' : key;
            params.append(paramKey, value);
          }
        });

        // Use our API helper to make authenticated request
        const result = await getWithAuth<CdrRecord[]>(
          `/api/cdr?${params.toString()}`
        );

        if (result.success) {
          // Get all the records
          const allRecords = result.data || [];
          console.log('CDR Records:', allRecords); // Debug log

          // Fetch caller locations for all records
          allRecords.forEach(record => {
            if (record.src) {
              fetchCallerLocation(record.src);
            }
          });

          // Calculate total pages based on records length
          const total = allRecords.length;
          setTotalPages(Math.ceil(total / recordsPerPage));
          props.refreshData();
          // Implement client-side pagination
          const startIndex = (page - 1) * recordsPerPage;
          const endIndex = startIndex + recordsPerPage;
          setRecords(allRecords.slice(startIndex, endIndex));
        } else {
          console.log('Failed to fetch CDR records:', result.message);
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              result.message || 'Failed to load CDR records. Please try again.'
          });
        }
      } catch (error) {
        console.error('Error fetching CDR records:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load CDR records. Please try again.'
        });
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchParams, page, toast, recordsPerPage]
  );

  // Initial fetch
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle page change
  useEffect(() => {
    // When page changes, refetch using current filters
    fetchRecords();
  }, [page, fetchRecords]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (searchQuery.trim() !== '') {
      console.log('Searching for:', searchQuery);
      console.log('Found records:', 
        records?.filter(record => 
          record.disposition && record.disposition.toLowerCase().includes(searchQuery.toLowerCase().trim())
        ).length
      );
    }
    setPage(1); // Reset to first page when searching
  };

  // Search handler for modal
  const handleAdvancedSearch = (filters: Record<string, string>) => {
    setSearchParams(filters);
    setPage(1);
    fetchRecords(filters);
    setIsSearchModalOpen(false);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Filter data based on search query
  const filteredRecords = records?.filter(
    (record) => {
      if (!searchQuery || searchQuery.trim() === '') {
        return true; // Show all records when no search query
      }
      
      const query = searchQuery.toLowerCase().trim();
      
      // Search in all relevant fields
      return (
        // Source number
        (record.src && record.src.toLowerCase().includes(query)) ||
        // Destination
        (record.dst && record.dst.toLowerCase().includes(query)) ||
        // User name
        (record.userName && record.userName.toLowerCase().includes(query)) ||
        // User email
        (record.userEmail && record.userEmail.toLowerCase().includes(query)) ||
        // Campaign number
        (record.campaignNumber && record.campaignNumber.toLowerCase().includes(query)) ||
        // Campaign name
        (record.campaignName && record.campaignName.toLowerCase().includes(query)) ||
        // Target number
        (record.targetNumber && record.targetNumber.toLowerCase().includes(query)) ||
        // Call status/disposition - special handling for common terms
        (record.disposition && (
          record.disposition.toLowerCase().includes(query) ||
          (query === 'answered' && record.disposition === 'ANSWERED') ||
          (query === 'no answer' && record.disposition === 'NO ANSWER') ||
          (query === 'busy' && record.disposition === 'BUSY') ||
          (query === 'failed' && record.disposition === 'FAILED')
        )) ||
        // Date and time
        (record.calldate && new Date(record.calldate).toLocaleString().toLowerCase().includes(query))
      );
    }
  );

  // Format disposition for better display
  const getDispositionClass = (disposition: string) => {
    switch (disposition) {
      case 'ANSWERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NO ANSWER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'BUSY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'FAILED':
      case 'CONCURRENCY FULL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'IN_QUEUE_CC_FULL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDisposition = (disposition: string) => {
    switch (disposition) {
      case 'ANSWERED':
        return 'Answered';
      case 'NO ANSWER':
        return 'No Answer';
      case 'BUSY':
        return 'Busy';
      case 'FAILED':
        return 'Failed';
      case 'CONCURRENCY FULL':
        return 'Concurrency Full';
      case 'IN_QUEUE_CC_FULL':
        return 'In-Queue | CC Full';
      default:
        return 'Unknown';
    }
  };

  // Download the currently filtered records as CSV
  const downloadCSV = () => {
    const headers = [
      'Date & Time',
      'Source Number',
      'Line Type',
      'Call From',
      'User Name',
      'User Email',
      'Campaign Number',
      'Campaign Name',
      'Target Number',
      'Ringing Time',
      'Duration',
      'Status'
    ];

    const rows = filteredRecords.map(record => [
      new Date(record.calldate).toLocaleString(),
      record.src,
      record.lineType || 'Unknown',
      callerLocations[record.src] || 'Unknown',
      record.userName || 'N/A',
      record.userEmail || 'N/A',
      record.campaignNumber || 'N/A',
      record.campaignName || 'N/A',
      record.targetNumber || 'N/A',
      formatDuration(record.ringingTime),
      formatDuration(record.billsec),
      record.disposition
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `call_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="flex gap-4">
          <div className="relative w-80">
            <Input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              className="pl-10 dark:border-zinc-700"
            />
            <HiMagnifyingGlass
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400"
              onClick={handleSearchClick}
            />
          </div>
          
          <Button
            onClick={downloadCSV}
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
          >
            <HiArrowDownTray className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        
        <Button
          onClick={() => setIsSearchModalOpen(true)}
          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <HiMagnifyingGlassPlus className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>
      </div>
      <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table>
            <TableHeader className="border-b-[1px] border-zinc-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Date & Time
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Source Number
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Line Type
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Call From
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    User Name
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    User Email
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Campaign Number
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Campaign Name
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Target Number
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Ringing Time
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Duration
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Status
                  </p>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Loading...
                    </p>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      No call records found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords?.map((record) => (
                  <TableRow
                    key={record.uniqueid}
                    className="border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {new Date(record.calldate).toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {record.src}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <span className={`py-1 px-2 rounded-full text-xs font-medium ${
                        record.lineType === 'voip' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {record.lineType || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {callerLocations[record.src] || 'Loading...'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {record.userName || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {record.userEmail || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {record.campaignNumber || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {record.campaignName || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {record.targetNumber || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {formatDuration(record.ringingTime)}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {formatDuration(record.billsec)}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <span
                        className={`py-1 px-2 rounded-full text-xs font-medium ${getDispositionClass(record.disposition)}`}
                      >
                        {formatDisposition(record.disposition)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-2 flex h-20 w-full items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Page {page} of {totalPages}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  variant="outline"
                  className="border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  variant="outline"
                  className="border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
}
