import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import React, { useState, useEffect } from 'react';
import { HiPencil, HiTrash, HiPlus, HiMagnifyingGlass } from 'react-icons/hi2';
import { EditModal, DeleteModal, CreateModal } from './Modal';
import { getWithAuth } from '@/utils/api-helpers';

type Target = {
  targetNumber: string;
  dailyCap: boolean;
  dailyCapValue: number;
  priority: number;
  concurrency: number;
  id?: number;
};

type Campaign = {
  id?: number;
  name: string;
  assignedNumber: string;
  createdBy: number;
  targets: Target[];
  campaignId?: number;
  type: 'roundrobin' | 'dupe';
  status: boolean;
};

function CampaignListTable(props: { refreshData: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const campaignsPerPage = 6;


  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const result = await getWithAuth<Campaign[]>('/api/campaigns');
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        console.error(
          'Expected success response with data array but got:',
          result
        );
        toast({
          variant: 'destructive',
          title: 'Error fetching campaigns',
          description: 'Failed to load campaign data. Please try again later.'
        });
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Failed to connect to the server. Please check your connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch campaigns
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSaveEdit = async (campaign: Campaign) => {
    try {
      console.log('Updating campaign:', campaign);
      // Make sure targets are included in the payload
      const payload = {
        id: campaign?.id,
        name: campaign?.name,
        assignedNumber: campaign?.assignedNumber,
        createdBy: campaign?.createdBy,
        targets: campaign?.targets || [],
        type: campaign?.type || 'roundrobin',
        status: campaign?.status !== undefined ? campaign?.status : true
      };

      // Use relative URL to ensure it works in all environments
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Log the response for debugging
      console.log('Update response status:', response.status);

      const result = await response.json();
      console.log('Update response data:', result);

      if (!result.success) {
        console.error('Server error:', result);
        toast({
          variant: 'destructive',
          title: 'Failed to update campaign',
          description:
            result.message || 'An error occurred while updating the campaign?.'
        });
        throw new Error('Failed to update campaign');
      }

      setData(
        data.map((item) =>
          item?.id === campaign?.id ? { ...item, ...result.data } : item
        )
      );
      setEditingCampaign(null);
      props.refreshData();
      toast({
        title: 'Campaign updated',
        description: 'Campaign information has been successfully updated.'
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update campaign?. Please try again.'
      });
    }
  };

  const handleConfirmDelete = async (campaign: Campaign) => {
    try {
      const response = await fetch(`/api/campaigns?id=${campaign?.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Failed to delete campaign',
          description:
            result.message || 'An error occurred while deleting the campaign?.'
        });
        throw new Error('Failed to delete campaign');
      }

      setData(data.filter((item) => item?.id !== campaign?.id));
      setDeletingCampaign(null);
      props.refreshData();
      toast({
        title: 'Campaign deleted',
        description: 'Campaign has been successfully removed.'
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete campaign?. Please try again.'
      });
    }
  };

  const handleCreate = async (newCampaign: Omit<Campaign, 'id'>) => {
    try {
      // Ensure all required fields are included
      const payload = {
        name: newCampaign?.name,
        assignedNumber: newCampaign?.assignedNumber,
        createdBy: newCampaign?.createdBy,
        targets: newCampaign?.targets || [],
        type: newCampaign?.type || 'roundrobin',
        status: newCampaign?.status !== undefined ? newCampaign?.status : true
      };

      console.log('Creating campaign with payload:', payload);
      console.log(
        'This should ONLY appear when the Create Campaign button is clicked'
      );

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      // if (!result.success) {
      //   console.error('Server error:', result);
      //   toast({
      //     variant: "destructive",
      //     title: "Failed to create campaign",
      //     description: result.message || "An error occurred while creating the campaign?.",
      //   });
      //   throw new Error('Failed to create campaign');
      // }

      // setData([...data, result.data]);
      fetchCampaigns();
      setIsCreateModalOpen(false);
      props.refreshData();
      toast({
        title: 'Campaign created',
        description: 'New campaign has been successfully created.'
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create campaign?. Please try again.'
      });
    }
  };

  // Filter data based on search query
  const filteredData = data.filter(
    (campaign) =>
      campaign?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      (campaign?.assignedNumber?.toLowerCase() || '').includes(
        searchQuery?.toLowerCase()
      ) ||
      campaign?.targets?.some((target) =>
        target.targetNumber?.toLowerCase().includes(searchQuery?.toLowerCase())
      )
  );

  // Calculate pagination based on filtered data
  const totalPages = Math.ceil(filteredData.length / campaignsPerPage);
  const startIndex = currentPage * campaignsPerPage;
  const displayedCampaigns = filteredData.slice(
    startIndex,
    startIndex + campaignsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'draft':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="relative w-80">
          <Input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 dark:border-zinc-700"
          />
          <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <HiPlus className="h-4 w-4 mr-2" />
          Add Campaign
        </Button>
      </div>
      <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table>
            <TableHeader className="border-b-[1px] border-zinc-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="pl-5">
                  {/* <Checkbox className="me-2.5" /> */}
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Name
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Assigned Number
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Type
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Status
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Targets
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Actions
                  </p>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Loading...
                    </p>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      No campaigns found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                displayedCampaigns.map((campaign, index) => (
                  <TableRow
                    key={`${campaign?.id}-${index}`}
                    className="border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex max-w-max items-center">
                        <Checkbox className="me-2.5" />
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {campaign?.name || 'N/A'}
                        </p>
                        {/* <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {campaign?.id || 'N/A'}</p> */}
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {campaign?.assignedNumber ? (
                          campaign?.assignedNumber
                            .split('-')
                            .map((number, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                              >
                                <span className="text-zinc-900 dark:text-zinc-100">
                                  {number}
                                </span>
                              </div>
                            ))
                        ) : (
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            N/A
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {campaign?.type === 'roundrobin'
                            ? 'Round Robin'
                            : 'Dupe'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {campaign?.status ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {campaign?.targets?.length || 0} target(s)
                        </p>
                        {/* {campaign?.targets && campaign?.targets.length > 0 && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          First: {campaign?.targets[0].targetNumber}
                        </p>
                      )} */}
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => setEditingCampaign(campaign)}
                        >
                          <HiPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                          onClick={() => setDeletingCampaign(campaign)}
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 flex h-20 w-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Showing {data.length} number of records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              variant="outline"
              className="border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage >= totalPages - 1}
              variant="outline"
              className="border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <EditModal
        campaign={editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onSave={handleSaveEdit}
      />

      <DeleteModal
        campaign={deletingCampaign}
        onClose={() => setDeletingCampaign(null)}
        onDelete={handleConfirmDelete}
      />

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

export default CampaignListTable;
