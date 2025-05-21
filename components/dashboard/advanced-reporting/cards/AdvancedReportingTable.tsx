import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import { HiMagnifyingGlass, HiArrowDownTray } from 'react-icons/hi2';
import { getWithAuth } from '@/utils/api-helpers';

// Define the structure for call records
export type CallRecord = {
  calldate: string;
  src: string;
  dst: string;
  duration: number;
  billsec: number;
  disposition: string;
  uniqueid: string;
  userName: string | null;
  userEmail: string | null;
  campaignNumber: string | null;
  campaignName: string | null;
  targetNumber: string | null;
  callerLocation?: string;
};

// Cache for location data
const locationCache: Record<string, string> = {};

export default function AdvancedReportingTable() {
  const { toast } = useToast();
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 10;

  // Fetch location data for a single record
  const fetchLocation = async (phoneNumber: string): Promise<string> => {
    // Check cache first
    if (locationCache[phoneNumber]) {
      return locationCache[phoneNumber];
    }

    try {
      console.log('Fetching location for:', phoneNumber);
      const response = await fetch(`/api/phone-location?phone=${phoneNumber}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Location API response:', data);

      let location = 'Unknown';
      if (data.success && data.city && data.region_code) {
        location = `${data.city.toUpperCase()}, ${data.region_code}`;
      }
      
      // Cache the result
      locationCache[phoneNumber] = location;
      return location;
    } catch (error) {
      console.error('Error fetching location:', error);
      return 'Unknown';
    }
  };

  // Fetch call records
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching records from CDR API...');
      const response = await fetch('/api/cdr', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('CDR API response:', result);

      if (result.success) {
        console.log('Successfully fetched records:', result.data?.length || 0);
        // First set the records without location data
        setRecords(result.data || []);
        setTotalPages(Math.ceil((result.data?.length || 0) / recordsPerPage));
        
        // Then fetch locations in the background
        if (result.data && result.data.length > 0) {
          console.log('Starting background location fetches...');
          // Process records in batches to avoid overwhelming the API
          const batchSize = 5;
          for (let i = 0; i < result.data.length; i += batchSize) {
            const batch = result.data.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (record) => {
                if (record.src && !locationCache[record.src]) {
                  const location = await fetchLocation(record.src);
                  setRecords(prevRecords => 
                    prevRecords.map(r => 
                      r.src === record.src ? { ...r, callerLocation: location } : r
                    )
                  );
                }
              })
            );
          }
        }
      } else {
        console.error('CDR API returned error:', result.message);
        throw new Error(result.message || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error in fetchRecords:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load call records. Please try again.",
      });
      setRecords([]);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records based on search query
  const filteredRecords = records.filter(record =>
    record.src?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.callerLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.campaignName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current page records
  const currentRecords = filteredRecords.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage
  );

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Download CSV
  const downloadCSV = () => {
    const headers = [
      'Date & Time',
      'Source Number',
      'Caller From',
      'User Name',
      'User Email',
      'Campaign Number',
      'Campaign Name',
      'Target Number',
      'Duration',
      'Status'
    ];

    const rows = filteredRecords.map(record => [
      new Date(record.calldate).toLocaleString(),
      record.src,
      record.callerLocation || 'Unknown',
      record.userName || 'N/A',
      record.userEmail || 'N/A',
      record.campaignNumber || 'N/A',
      record.campaignName || 'N/A',
      record.targetNumber || 'N/A',
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
    link.setAttribute('download', `advanced_report_${new Date().toISOString().split('T')[0]}.csv`);
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
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
            <HiMagnifyingGlass
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500"
              onClick={handleSearch}
            />
          </div>
          <Button
            onClick={downloadCSV}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <HiArrowDownTray className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="h-full w-full p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Source Number</TableHead>
                <TableHead>Caller From</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Campaign Number</TableHead>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Target Number</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((record) => (
                  <TableRow key={record.uniqueid}>
                    <TableCell>{new Date(record.calldate).toLocaleString()}</TableCell>
                    <TableCell>{record.src}</TableCell>
                    <TableCell>{record.callerLocation || 'Loading...'}</TableCell>
                    <TableCell>{record.userName || 'N/A'}</TableCell>
                    <TableCell>{record.userEmail || 'N/A'}</TableCell>
                    <TableCell>{record.campaignNumber || 'N/A'}</TableCell>
                    <TableCell>{record.campaignName || 'N/A'}</TableCell>
                    <TableCell>{record.targetNumber || 'N/A'}</TableCell>
                    <TableCell>{formatDuration(record.billsec)}</TableCell>
                    <TableCell>{record.disposition}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center px-4 py-2">
            <Button
              onClick={handlePrevPage}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={page === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
} 