import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { putWithAuth, postWithAuth, getWithAuth } from '@/utils/api-helpers';

export type Trunk = {
  id: number;
  name: string;
  status: boolean;
  inboundEnabled: number;
  outboundEnabled: number;
  trunkName: string;
  serverIp: string;
  username: string;
  secret: string;
  ipAuth: boolean;
  prefix: string;
  createdAt?: string;
};

function TrunkListTable(props: { refreshData: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<Trunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<Trunk | null>(null);
  const [deletingTrunk, setDeletingTrunk] = useState<Trunk | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const trunksPerPage = 6;

  // Fetch trunks
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://dialo.dollu.com/rest/trunks');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          console.error(
            'Expected success response with data array but got:',
            result
          );
          toast({
            variant: 'destructive',
            title: 'Error fetching trunks',
            description: 'Failed to load user data. Please try again later.'
          });
        }
      } catch (error) {
        console.error('Failed to fetch trunks:', error);
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

    fetchUsers();
  }, [toast]);

  const handleEdit = async (trunk: Trunk) => {
    try {
      // Remove createdAt from the trunk object
      const { createdAt, ...trunkWithoutCreatedAt } = trunk;
      
      const response = await fetch(`https://dialo.dollu.com/rest/trunks/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trunkWithoutCreatedAt),
      });

      if (!response.ok) {
        throw new Error('Failed to update trunk');
      }

      const result = await response.json();
      
      if (result.success) {
        props.refreshData();
        toast({
          title: 'Success',
          description: 'Trunk updated successfully'
        });
        setEditingTrunk(null);
        fetchTrunks();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to update trunk'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update trunk'
      });
    }
  };

  const handleConfirmDelete = async (trunk: Trunk) => {
    try {
      const response = await fetch(
        `https://dialo.dollu.com/rest/trunks/${trunk.id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete trunk');
      }

      const result = await response.json();

      if (result.success) {
        setData(data.filter((item) => item.id !== trunk.id));
        setDeletingTrunk(null);
        props.refreshData();
        toast({
          title: 'Trunk deleted',
          description: 'Trunk has been successfully removed.'
        });
      } else {
        throw new Error(result.message || 'Failed to delete trunk');
      }
    } catch (error) {
      console.error('Error deleting trunk:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete trunk. Please try again.'
      });
    }
  };

  const handleCreate = async (newTrunk: Omit<Trunk, 'id'>) => {
    try {
      const response = await fetch('https://dialo.dollu.com/rest/trunks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrunk),
      });

      if (!response.ok) {
        throw new Error('Failed to create trunk');
      }

      const result = await response.json();
      
      if (result.success) {
        props.refreshData();
        toast({
          title: 'Success',
          description: 'Trunk created successfully'
        });
        setIsCreateModalOpen(false);
        fetchTrunks();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to create trunk'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create trunk'
      });
    }
  };

  // Filter data based on search query
  const filteredData = data?.filter(
    (trunk) =>
      trunk?.trunkName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      trunk?.serverIp?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      trunk?.username?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / trunksPerPage);
  const startIndex = currentPage * trunksPerPage;
  const displayedTrunks = filteredData.slice(
    startIndex,
    startIndex + trunksPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const fetchTrunks = async () => {
    try {
      const response = await fetch('https://dialo.dollu.com/rest/trunks');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setData(result.data || []);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to fetch trunks'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch trunks'
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="relative w-80">
          <Input
            type="text"
            placeholder="Search trunks..."
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
          Add Trunk
        </Button>
      </div>
      <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table>
            <TableHeader className="border-b-[1px] border-zinc-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Trunk Name
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Server IP
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Prefix
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Username
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Inbound
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Outbound
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    IP Auth
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Status
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer pl-5 pr-4 pt-2 text-start">
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
                      No trunks found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                displayedTrunks.map((trunk) => (
                  <TableRow
                    key={trunk.id}
                    className="border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.trunkName}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.serverIp}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.prefix || '-'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.username}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.inboundEnabled == 1 ? 'True' : 'False'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.outboundEnabled == 1 ? 'True' : 'False'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.ipAuth ? 'Yes' : 'No'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {trunk.status ? 'Active' : 'Inactive'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTrunk(trunk)}
                          className="h-8 w-8 rounded-md hover:bg-zinc-900/5 dark:hover:bg-zinc-50/5"
                        >
                          <HiPencil className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingTrunk(trunk)}
                          className="h-8 w-8 rounded-md hover:bg-zinc-900/5 dark:hover:bg-zinc-50/5"
                        >
                          <HiTrash className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
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

      {editingTrunk && (
        <EditModal
          isOpen={!!editingTrunk}
          onClose={() => setEditingTrunk(null)}
          onSave={handleEdit}
          data={editingTrunk}
        />
      )}

      {deletingTrunk && (
        <DeleteModal
          isOpen={!!deletingTrunk}
          onClose={() => setDeletingTrunk(null)}
          onConfirm={() => handleConfirmDelete(deletingTrunk)}
          itemName={deletingTrunk.trunkName}
        />
      )}

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

export default TrunkListTable;
