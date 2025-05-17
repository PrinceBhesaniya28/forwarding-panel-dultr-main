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
import { HiMagnifyingGlass, HiPlus, HiTrash, HiPencil, HiArrowPath } from "react-icons/hi2";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddTargetModal, EditTargetModal, TargetRecord } from "./Modal";
import { Switch } from "@/components/ui/switch";

export default function TargetListTable(props: { refreshData: () => void }) {
  const { toast } = useToast();
  const [targets, setTargets] = useState<TargetRecord[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTargetModalOpen, setIsAddTargetModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetRecord | null>(null);
  const recordsPerPage = 10;

  // Fetch target records - Now handled by SSE
  const fetchTargets = useCallback(async () => {
    // This function is kept for compatibility with other code that might call it
    console.log("fetchTargets called - but data is now handled by SSE");
    // No need to do anything as the SSE connection will automatically update the data
  }, []);
  
  // Fetch campaigns for dropdown
  const fetchCampaigns = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
        
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log(`API responded with status: ${response.status}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setCampaigns(result.data);
      } else {
        console.log('Failed to fetch campaigns');
        // If API fails, add at least a test campaign
        setCampaigns([{ id: 'test', name: 'test campaign' }]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // If error, add a test campaign
      setCampaigns([{ id: 'test', name: 'test campaign' }]);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    // fetchTargets is now handled by SSE
    fetchCampaigns(); // Still need to fetch campaigns
  }, [fetchCampaigns]);

  // Handle page change - Now handled by the SSE useEffect
  // useEffect(() => {
  //   // When page changes, the SSE data will be reprocessed with the new page
  // }, [page]);

  // Setup SSE connection for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const setupSSE = () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          console.error("No auth token found");
          return;
        }

        // Create SSE connection
        const url = new URL(`/api/targets/sse`, window.location.origin);
        url.searchParams.append('token', authToken);
        
        console.log("Connecting to targets SSE endpoint:", url.toString());
        eventSource = new EventSource(url.toString());

        // Listen for messages
        eventSource.onmessage = (event) => {
          try {
            const result = JSON.parse(event.data);
            console.log("Received targets SSE data:", result);
            
            if (result.success) {
              // Get all the records
              const allTargets = result.data || [];
              
              // Calculate total pages based on records length
              const total = allTargets.length;
              setTotalPages(Math.ceil(total / recordsPerPage));
              
              // Implement client-side pagination
              const startIndex = (page - 1) * recordsPerPage;
              const endIndex = startIndex + recordsPerPage;
              setTargets(allTargets.slice(startIndex, endIndex));
              setIsLoading(false);
            } else {
              console.log('Failed to fetch target records from SSE');
            }
          } catch (error) {
            console.error("Error processing SSE message:", error);
          }
        };

        // Handle connection events
        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);
          // Try to reconnect on error
          if (eventSource) {
            eventSource.close();
            setTimeout(setupSSE, 5000); // Retry after 5 seconds
          }
        };

        eventSource.onopen = () => {
          console.log("Targets SSE connection established");
        };
      } catch (error) {
        console.error("Failed to setup targets SSE:", error);
      }
    };

    // Set up SSE connection
    setupSSE();

    // Clean up on component unmount
    return () => {
      if (eventSource) {
        console.log("Closing targets SSE connection");
        eventSource.close();
      }
    };
  }, [page, recordsPerPage]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter data based on search query
  const filteredTargets = targets?.filter(target => 
    target.targetNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    target.campaignName?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

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

  /**
   * Calculate percentage for today&apos;s progress
   */
  const calculateProgress = (today: number, dailyCap: number): number => {
    if (dailyCap <= 0) return 0;
    const percentage = (today / dailyCap) * 100;
    return Math.min(percentage, 100);
  };

  // Handle delete target
  const handleDeleteTarget = async () => {
    if (!deleteTarget) return;
    
    try {
      const response = await fetch(`/api/targets?id=${deleteTarget}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        props.refreshData();
        toast({
          title: "Target deleted",
          description: "The target has been successfully deleted.",
        });
        fetchTargets(); // Refresh the list
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete target. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error deleting target:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete target. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // Handle add target
  const handleAddTarget = async (newTarget: Omit<TargetRecord, 'today'>) => {
    try {
      // Format the request to match the API expectations
      const payload = {
        campaignId: newTarget.campaignId,
        targetNumber: newTarget.targetNumber,
        priority: newTarget.priority || 1,
        dailyCap: newTarget.dailyCap || 1,
        dailyCapValue: newTarget.dailyCapValue,
        concurrency: newTarget.concurrency,
        dialDuration: newTarget.dialDuration || 30
      };
      
      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        props.refreshData();
        toast({
          title: "Target added",
          description: "The target has been successfully added.",
        });
        fetchTargets(); // Refresh the list
        setIsAddTargetModalOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add target. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error adding target:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add target. Please try again.",
      });
    }
  };

  // Handle update/edit target
  const handleUpdateTarget = async (updatedTarget: TargetRecord) => {
    try {
      // Format the request to match the API expectations
      const payload = {
        id: updatedTarget.id,
        campaignId: updatedTarget.campaignId,
        targetNumber: updatedTarget.targetNumber,
        priority: updatedTarget.priority || 1,
        dailyCap: updatedTarget.dailyCap || 1,
        dailyCapValue: updatedTarget.dailyCapValue,
        concurrency: updatedTarget.concurrency,
        dialDuration: updatedTarget.dialDuration || 30
      };
      
      // Use the main targets endpoint with PUT method
      const response = await fetch('/api/targets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        props.refreshData();
        toast({
          title: "Target updated",
          description: "The target has been successfully updated.",
        });
        fetchTargets(); // Refresh the list
        setEditingTarget(null); // Close the edit modal
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update target. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error updating target:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update target. Please try again.",
      });
    }
  };

  // Handle reset target
  const handleResetTarget = async (targetId: string) => {
    try {
      const response = await fetch('/api/targets/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetId }),
      });
      
      if (response.ok) {
        toast({
          title: "Target reset",
          description: "The target has been successfully reset.",
        });
        fetchTargets(); // Refresh the list
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to reset target. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error resetting target:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset target. Please try again.",
      });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (targetId: string) => {
    setDeleteTarget(targetId);
    setIsDeleteDialogOpen(true);
  };

  // Add a function to open the edit modal
  const openEditModal = (target: TargetRecord) => {
    setEditingTarget(target);
  };

  // Handle toggle target status
  const handleToggleStatus = async (targetId: string, enabled: boolean) => {
    try {
      // Format the request to match the API expectations
      const payload = {
        id: targetId,
        status: enabled ? 1 : 0
      };
      
      // Use the existing update target endpoint with PUT method
      const response = await fetch('/api/targets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        props.refreshData();
        toast({
          title: enabled ? "Target enabled" : "Target disabled",
          description: `The target has been successfully ${enabled ? 'enabled' : 'disabled'}.`,
        });
        fetchTargets(); // Refresh the list
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to ${enabled ? 'enable' : 'disable'} target. Please try again.`,
        });
      }
    } catch (error) {
      console.error('Error updating target status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${enabled ? 'enable' : 'disable'} target. Please try again.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="relative w-80">
          <Input
            type="text"
            placeholder="Search targets..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 dark:border-zinc-700"
          />
          <HiMagnifyingGlass 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" 
          />
        </div>
        <Button
          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          onClick={() => setIsAddTargetModalOpen(true)}
        >
          <HiPlus className="h-4 w-4 mr-2" />
          Add Target
        </Button>
      </div>
      <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table>
            <TableHeader className="border-b-[1px] border-zinc-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target Number</p>
                </TableHead>
                <TableHead className="border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Campaign Name</p>
                </TableHead>
                <TableHead className="border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Daily Cap</p>
                </TableHead>
                <TableHead className="border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Concurrency</p>
                </TableHead>
                {/* <TableHead className="border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Today&apos;s Progress</p>
                </TableHead> */}
                <TableHead className="border-zinc-200 pl-12 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Actions</p>
                </TableHead>
                {/* <TableHead className="border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Enable/Disable</p>
                </TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTargets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No target records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTargets?.map((target, index) => (
                  <TableRow key={index} className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{target.targetNumber}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{target.campaignName}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{target.today || 0}/{target.dailyCapValue}</p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{target.currentConcurrency}/{target.concurrency}</p>
                    </TableCell>
                    {/* <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {Math.round(calculateProgress(target.today, target.dailyCapValue))}%
                      </p>
                    </TableCell> */}
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => openEditModal(target)}
                        >
                          <HiPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => {
                            // Use target.id if available, otherwise use target.targetNumber
                            const idToDelete = target.id ? target.id.toString() : target.targetNumber;
                            openDeleteDialog(idToDelete);
                          }}
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => {
                            // Use target.id if available, otherwise use target.targetNumber
                            const idToReset = target.id ? target.id.toString() : target.targetNumber;
                            handleResetTarget(idToReset);
                          }}
                        >
                          <HiArrowPath className="h-4 w-4" />
                        </Button>
                        <Switch 
                          checked={target.status === 1}
                          style={{ height: '20px' }}
                          onCheckedChange={(checked) => {
                            // Use target.id if available, otherwise use target.targetNumber
                            const idToToggle = target.id ? target.id.toString() : target.targetNumber;
                            handleToggleStatus(idToToggle, checked);
                          }}
                        />
                      </div>
                    </TableCell>
                    {/* <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex items-center justify-center">
                        <Switch 
                          checked={target.status === 1}
                          onCheckedChange={(checked) => {
                            // Use target.id if available, otherwise use target.targetNumber
                            const idToToggle = target.id ? target.id.toString() : target.targetNumber;
                            handleToggleStatus(idToToggle, checked);
                          }}
                        />
                      </div>
                    </TableCell> */}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the target number {deleteTarget}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTarget} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Target Modal */}
      <AddTargetModal
        isOpen={isAddTargetModalOpen}
        onClose={() => setIsAddTargetModalOpen(false)}
        onAdd={handleAddTarget}
        campaigns={campaigns}
      />
      
      {/* Edit Target Modal */}
      <EditTargetModal
        target={editingTarget}
        onClose={() => setEditingTarget(null)}
        onSave={handleUpdateTarget}
        campaigns={campaigns}
      />
    </div>
  );
}
