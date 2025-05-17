import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HiMagnifyingGlass, HiMagnifyingGlassPlus, HiArrowDownTray, HiXMark } from "react-icons/hi2";
import { getWithAuth } from "@/utils/api-helpers";
import { getUserRole } from "@/utils/auth";

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
  email: string;
  charges: string;
  lastdata: string;
  duration: number;
  billsec: number;
  disposition: string;
  amaflags: number;
  accountcode: string;
  userfield: string;
  uniqueid: string;
  userid: number | null;
  campaignNumber: string | null;
  targetNumber: string | null;
  callDisposition: string | null;
  identity: string | null;
  campaignName: string | null;
  ringingTime: number;
  userName: string | null;
};

// Format duration in seconds to a readable format
function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  
  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  
  return `${formattedMinutes}:${formattedSeconds}`;
}

export default function CheckTable() {
  const { toast } = useToast();
  const [records, setRecords] = useState<CdrRecord[]>([]);
  const [allRecords, setAllRecords] = useState<CdrRecord[]>([]); // Store all fetched records
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const recordsPerPage = 7;

  // Check if user is admin
  useEffect(() => {
    const userRole = getUserRole();
    setIsAdmin(userRole === 'admin');
  }, []);

  // Fetch CDR records with filtering
  const fetchRecords = useCallback(async (filters = searchParams) => {
    setIsLoading(true);
    try {
      // Build query parameters for backend
      const params = new URLSearchParams();
      
      // Add date parameters for the last 24 hours
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 1); // 24 hours ago
      
      // Format dates and add to params
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', endDate.toISOString().split('T')[0]);
      
      // Add advanced search filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Use our API helper to make authenticated request
      console.log('PARAMS', params)
      const result = await getWithAuth<CdrRecord[]>(`/api/cdr?${params.toString()}`);
      
      if (result.success) {
        // Get all the records
        const fetchedRecords = result.data || [];
        setAllRecords(fetchedRecords); // Store all records for client-side filtering
        
        // Apply search filter if there's a search query
        const filteredRecords = searchQuery 
          ? applySearchFilter(fetchedRecords, searchQuery)
          : fetchedRecords;
        
        // Calculate total pages based on filtered records length
        const total = filteredRecords.length;
        setTotalPages(Math.ceil(total / recordsPerPage));
        
        // Implement client-side pagination
        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        setRecords(filteredRecords.slice(startIndex, endIndex));
      } else {
        console.log('Failed to fetch CDR records:', result.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to load CDR records. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error fetching CDR records:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load CDR records. Please try again.",
      });
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, page, toast, recordsPerPage, searchQuery]);

  // Function to apply search filter to records
  const applySearchFilter = (records: CdrRecord[], query: string) => {
    if (!query.trim()) return records;
    
    const lowerQuery = query.toLowerCase();
    return records.filter(record => 
      (record.userName?.toLowerCase() || '').includes(lowerQuery) ||
      (record.email?.toLowerCase() || '').includes(lowerQuery) ||
      (record.src?.toLowerCase() || '').includes(lowerQuery) ||
      (record.dst?.toLowerCase() || '').includes(lowerQuery) ||
      (record.campaignNumber?.toLowerCase() || '').includes(lowerQuery) ||
      (record.campaignName?.toLowerCase() || '').includes(lowerQuery) ||
      (record.targetNumber?.toLowerCase() || '').includes(lowerQuery) ||
      (record.uniqueid?.toLowerCase() || '').includes(lowerQuery)
    );
  };

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
    // Apply client-side filtering to all records
    const filtered = applySearchFilter(allRecords, searchQuery);
    
    // Update total pages based on filtered records
    setTotalPages(Math.ceil(filtered.length / recordsPerPage));
    
    // Reset to first page and show first page of results
    setPage(1);
    setRecords(filtered.slice(0, recordsPerPage));
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

  // Format disposition for better display
  const getDispositionClass = (disposition: string) => {
    switch (disposition) {
      case "ANSWERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "NO ANSWER":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "BUSY":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDisposition = (disposition: string) => {
    switch (disposition) {
      case "ANSWERED":
        return "Answered";
      case "NO ANSWER":
        return "No Answer";
      case "BUSY":
        return "Busy";
      case "FAILED":
        return "Failed";
      default:
        return disposition;
    }
  };

  // Function to export data to CSV
  const exportToCSV = async () => {
    try {
      // Show loading toast
      toast({
        title: "Exporting data",
        description: "Preparing CSV export of all records...",
      });
      
      let exportRecords;
      
      // If there's an active search query, use the filtered records
      if (searchQuery.trim()) {
        exportRecords = applySearchFilter(allRecords, searchQuery);
      } else {
        // Otherwise fetch all data from API
        // Build query parameters for backend - same as in fetchRecords
        const params = new URLSearchParams();
        
        // Add date parameters for the last 24 hours
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1); // 24 hours ago
        
        // Format dates and add to params
        params.append('startDate', startDate.toISOString().split('T')[0]);
        params.append('endDate', endDate.toISOString().split('T')[0]);
        
        // Add advanced search filters
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        
        // Fetch all data from API without pagination
        const result = await getWithAuth<CdrRecord[]>(`/api/cdr?${params.toString()}`);
        
        if (!result.success || !result.data) {
          throw new Error(result.message || "Failed to fetch data for export");
        }
        
        exportRecords = result.data;
      }
      
      // Define headers based on visible columns
      const headers = [
        'Date & Time',
        'User Name',
        'User Email',
        'Source Number',
        'Campaign Number',
        'Campaign Name',
        'Target Number',
        'Ringing Time',
        'Duration'
      ];
      
      // Add Charges column for admin
      if (isAdmin) {
        headers.push('Charges');
      }
      
      headers.push('Status');
      
      // Convert records to CSV format
      const csvContent = exportRecords.map(record => {
        const row = [
          new Date(record.calldate).toLocaleString(),
          record.userName || 'N/A',
          record.email || 'N/A',
          record.src || 'N/A',
          record.campaignNumber || 'N/A',
          record.campaignName || 'N/A',
          record.targetNumber || 'N/A',
          formatDuration(record.ringingTime),
          formatDuration(record.duration)
        ];
        
        if (isAdmin) {
          row.push(record.charges || 'N/A');
        }
        
        row.push(formatDisposition(record.disposition));
        
        // Escape any commas in the fields
        return row.map(field => {
          if (typeof field === 'string' && field.includes(',')) {
            return `"${field}"`;
          }
          return field;
        }).join(',');
      });
      
      // Add headers to the beginning
      csvContent.unshift(headers.join(','));
      
      // Create a Blob and download link
      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `call_records_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV Exported",
        description: `${exportRecords.length} call records have been exported to CSV.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export data to CSV. Please try again.",
      });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    // Reset to showing all records
    setPage(1);
    fetchRecords();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pt-4 gap-4">
        <div className="relative w-80">
          {/* <Input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
            className="pl-10 pr-8 dark:border-zinc-700"
          />
          <HiMagnifyingGlass 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400 cursor-pointer" 
            onClick={handleSearchClick}
          />
          {searchQuery && (
            <HiXMark
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
              onClick={clearSearch}
            />
          )} */}
        </div>
        
        <div className="flex items-center gap-2">
          {searchQuery && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">
              {allRecords.length > 0 ? 
                `Showing ${applySearchFilter(allRecords, searchQuery).length} of ${allRecords.length} records` :
                'No records found'
              }
            </div>
          )}
          <Button
            onClick={exportToCSV}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <HiArrowDownTray className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table>
            <TableHeader className="border-b-[1px] border-zinc-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Date & Time</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">User Name</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">User Email</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Source Number</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Campaign Number</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Campaign Name</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target Number</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Ringing Time</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Duration</p>
                </TableHead>
                {isAdmin && (
                  <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Charges</p>
                  </TableHead>
                )}
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Status</p>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading...</p>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No call records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                records?.map((record) => (
                  <TableRow key={record.uniqueid} className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {new Date(record.calldate).toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{record.userName || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{record.email || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{record.src || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{record.campaignNumber || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{record.campaignName || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{record.targetNumber|| 'N/A'}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{formatDuration(record.ringingTime)}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{formatDuration(record.duration)}</p>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{record.charges || 'N/A'}</p>
                      </TableCell>
                    )}
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <span className={`py-1 px-2 rounded-full text-xs font-medium ${getDispositionClass(record.disposition)}`}>
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
    </div>
  );
}