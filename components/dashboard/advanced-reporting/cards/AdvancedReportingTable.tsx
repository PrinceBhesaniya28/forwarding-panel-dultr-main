import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

// Helper to get today date range (midnight to midnight, YYYY-MM-DD)
function getTodayDateRange() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  return {
    startDate: startOfDay.toISOString().split('T')[0],
    endDate: endOfDay.toISOString().split('T')[0]
  };
}

export default function AdvancedReportingTable() {
  const { toast } = useToast();
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchResults, setSearchResults] = useState<CallRecord[]>([]);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadSearchQuery, setDownloadSearchQuery] = useState('');
  const [downloadResults, setDownloadResults] = useState<CallRecord[]>([]);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
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

  // Fetch call records (now only for today, midnight to midnight)
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Fetch records with pagination
      const response = await fetch(`/api/cdr?limit=${recordsPerPage}&offset=${(page - 1) * recordsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('CDR API response:', result);

      if (result.success) {
        setRecords(result.data || []);
        setTotalPages(Math.ceil(result.total / recordsPerPage));
      } else {
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
  }, [page, recordsPerPage, toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filter records based on search query
  const filterRecords = (query: string) => {
    const filtered = records.filter(record =>
      record.src?.toLowerCase().includes(query.toLowerCase()) ||
      record.callerLocation?.toLowerCase().includes(query.toLowerCase()) ||
      record.userName?.toLowerCase().includes(query.toLowerCase()) ||
      record.userEmail?.toLowerCase().includes(query.toLowerCase()) ||
      record.campaignName?.toLowerCase().includes(query.toLowerCase()) ||
      record.disposition?.toLowerCase().includes(query.toLowerCase())
    );
    console.log('Filtered records count:', filtered.length);
    return filtered;
  };

  // Get current page records
  const currentRecords = searchQuery ? searchResults : records.slice(
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
  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      setPage(1);
      setTotalPages(Math.ceil(records.length / recordsPerPage));
      return;
    }

    setIsLoading(true);
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Fetch ALL records by setting a high limit
      const response = await fetch('/api/cdr?limit=10000', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('CDR API response:', result);

      if (result.success) {
        // Search through all records, focusing on disposition field
        const searchTerm = searchQuery.toUpperCase();
        const allMatchingResults = (result.data || []).filter(record => {
          const disposition = record.disposition?.toUpperCase() || '';
          return disposition.includes(searchTerm);
        });
        console.log('Total matching results:', allMatchingResults.length);

        // Set the search results and show all on one page
        setSearchResults(allMatchingResults);
        setPage(1);
        setTotalPages(1); // Force all results to show on one page

        // Show toast with number of results found
        toast({
          title: "Search Results",
          description: `Found ${allMatchingResults.length} records matching "${searchQuery}"`,
        });
      } else {
        throw new Error(result.message || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search records. Please try again.",
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Download dialog search handler
  const handleDownloadSearch = async () => {
    setIsDownloadLoading(true);
    // Filter by disposition (status)
    const filtered = records.filter(record =>
      record.disposition?.toLowerCase().includes(downloadSearchQuery.toLowerCase())
    );
    setDownloadResults(filtered);
    setIsDownloadLoading(false);
  };

  // Download CSV for dialog
  const downloadCSV = () => {
    if (downloadResults.length === 0) return;
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
    const rows = downloadResults.map(record => [
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
    link.setAttribute('download', `advanced_report_${downloadSearchQuery}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloadDialogOpen(false);
    setDownloadSearchQuery('');
    setDownloadResults([]);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center py-4">
          <div className="text-sm text-zinc-500">Total Records</div>
          <div className="text-2xl font-bold">{records.length}</div>
        </Card>
        {/* You can add more summary cards here if needed */}
      </div>

      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="flex gap-4">
          <div className="relative w-80">
            <Input
              type="text"
              placeholder="Search by status (e.g., ANSWERED, NO ANSWER)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
            <HiMagnifyingGlass
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500"
              onClick={handleSearch}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setPage(1);
                  setTotalPages(Math.ceil(records.length / recordsPerPage));
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              >
                ×
              </button>
            )}
          </div>
          <Button
            onClick={() => setIsDownloadDialogOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <HiArrowDownTray className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Download Dialog */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Filtered Records</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search by status (e.g., ANSWERED, NO ANSWER)..."
              value={downloadSearchQuery}
              onChange={e => setDownloadSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDownloadSearch()}
            />
            <Button onClick={handleDownloadSearch} className="ml-2 mt-2">
              <HiMagnifyingGlass className="mr-1" />
              Search
            </Button>
          </div>
          {isDownloadLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto mt-4">
              {downloadResults.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Source Number</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloadResults.map(record => (
                      <tr key={record.uniqueid}>
                        <td>{new Date(record.calldate).toLocaleString()}</td>
                        <td>{record.src}</td>
                        <td>{record.disposition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-zinc-400">No records found</div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDownloadDialogOpen(false);
                setDownloadSearchQuery('');
                setDownloadResults([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={downloadCSV}
              disabled={downloadResults.length === 0}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Download {downloadResults.length > 0 ? `(${downloadResults.length} records)` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

        {/* Only show pagination when not searching */}
        {!isLoading && !searchQuery && totalPages > 1 && (
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