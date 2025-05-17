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
import { HiMagnifyingGlass, HiPhone } from "react-icons/hi2";
import { getAuthToken } from "@/utils/auth";

// Define the structure for live call data
export type LiveCall = {
  key: string;
  callerNumber: string;
  assignedNumber: string;
  campaignName: string;
  status: string;
  timestamp: string;
  userId: string;
  campaignNumber: string;
  targetNumber: string;
  channelId: string;
  startTime: string;
  lastUpdate: string;
  dialStatus: string;
  duration: string;
};

// Format duration in seconds to a readable format
function formatDuration(seconds: string): string {
  const duration = parseInt(seconds);
  if (isNaN(duration) || duration < 0) return "00:00";
  
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const remainingSeconds = Math.floor(duration % 60);
  
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  
  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Format timestamp to a readable date/time
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    return timestamp;
  }
}

export default function LiveListTable() {
  const { toast } = useToast();
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [hangingUpCallIds, setHangingUpCallIds] = useState<string[]>([]);

  // Set up SSE connection
  useEffect(() => {
    console.log('Setting up SSE connection...');
    const authToken = getAuthToken();
    if (!authToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "No authentication token found. Please log in again.",
      });
      return;
    }

    const es = new EventSource(`/api/calls/live/sse?token=${authToken}`, {
      withCredentials: true
    });

    es.onopen = () => {
      console.log('SSE connection opened');
      setIsLoading(true);
    };

    es.onmessage = (event) => {
      try {
        console.log('Received SSE message:', event.data);
        const data = JSON.parse(event.data);
        if (data.success && data.data) {
          // Flatten the data structure from campaign-based to a single array of calls
          const allCalls: LiveCall[] = [];
          const campaignData = data.data as Record<string, LiveCall[]>;
          
          Object.values(campaignData).forEach(campaignCalls => {
            allCalls.push(...campaignCalls);
          });
          
          setLiveCalls(allCalls);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process live calls data.",
        });
      }
    };

    es.onerror = (error) => {
      console.error('SSE Error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Lost connection to live calls stream. Please refresh the page.",
      });
      es.close();
    };

    setEventSource(es);

    // Clean up on component unmount
    return () => {
      console.log('Cleaning up SSE connection...');
      if (es) {
        es.close();
      }
    };
  }, [toast]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter data based on search query
  const filteredCalls = liveCalls?.filter(call => 
    call.callerNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    call.targetNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    call.campaignName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    call.campaignNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    call.status?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  // Format status for better display
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "answered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ringing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "busy":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle hang up call
  const handleHangUp = async (channelId: string, assignedNumber: string, targetNumber: string) => {
    try {
      // Add call to hanging up state for UI feedback
      setHangingUpCallIds(prev => [...prev, channelId]);
      
      const authToken = getAuthToken();
      // if (!authToken) {
      //   toast({
      //     variant: "destructive",
      //     title: "Authentication Error",
      //     description: "No authentication token found. Please log in again.",
      //   });
      //   setHangingUpCallIds(prev => prev.filter(id => id !== channelId));
      //   return;
      // }

      // Use the API route to handle the request to the external service
      const response = await fetch('/api/calls/hangup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          channel: channelId,
          assignedNumber,
          targetNumber
        })
      });

      if (response.ok) {
        toast({
          title: "Call Ended",
          description: "The call has been successfully hung up.",
        });
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error hanging up call:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to hang up call: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      // Remove call from hanging up state
      setHangingUpCallIds(prev => prev.filter(id => id !== channelId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search live calls..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 dark:border-zinc-700"
          />
          <HiMagnifyingGlass 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" 
          />
        </div>
      </div>
      <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table>
            <TableHeader className="border-b-[1px] border-zinc-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Timestamp</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Caller Number</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Campaign Number</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target Number</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Campaign Name</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Duration</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Status</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Action</p>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading live calls...</p>
                  </TableCell>
                </TableRow>
              ) : filteredCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No live calls found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalls.map((call) => (
                  <TableRow key={call.key} className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {formatTimestamp(call.timestamp)}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{call.callerNumber}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{call.campaignNumber}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{call.targetNumber}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {call.campaignName}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {formatDuration(call.duration)}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <span className={`py-1 px-2 rounded-full text-xs font-medium ${getStatusClass(call.status)}`}>
                        {formatStatus(call.status)}
                      </span>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <Button
                        variant={hangingUpCallIds.includes(call.channelId) ? "destructive" : "outline"}
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleHangUp(call.channelId, call.assignedNumber, call.targetNumber)}
                        title="Hang Up Call"
                        disabled={hangingUpCallIds.includes(call.channelId)}
                      >
                        <HiPhone className="h-4 w-4 rotate-135" />
                        {hangingUpCallIds.includes(call.channelId) ? "Hanging up..." : "Hang Up"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
