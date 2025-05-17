import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
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
import { getUserRole } from '@/utils/auth';

type PhoneNumber = {
  id: number;
  number: string;
  assignedTo: number;
  status: string;
  callRate: number;
  billBlockRate: number;
  risk: string;
  enabled: number;
  user: {
    email: string;
  };
};

function NumberListTable(props: { freshData: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNumber, setEditingNumber] = useState<PhoneNumber | null>(null);
  const [deletingNumber, setDeletingNumber] = useState<PhoneNumber | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const numbersPerPage = 6;
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const userRole = getUserRole();

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchNumbers = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching phone numbers from API...');
        const result = await getWithAuth<{ success: boolean; data: PhoneNumber[] }>('/api/numbers');
        console.log('API response data:', result);
        
        if (result.success && Array.isArray(result.data)) {
          console.log('Setting phone number data:', result.data);
          setData(result.data);
        } else {
          console.error('Expected success response with data array but got:', result);
          toast({
            variant: "destructive",
            title: "Error fetching phone numbers",
            description: "Failed to load phone number data. Please try again later.",
          });
        }
      } catch (error) {
        console.error('Failed to fetch phone numbers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to connect to the server. Please check your connection.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNumbers();
  }, [refreshTrigger, toast]);

  const handleSaveEdit = async (number: PhoneNumber) => {
    try {
      console.log('Updating phone number:', number);
      const response = await fetch('/api/numbers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: number.id,
          number: number.number,
          assignedTo: number.assignedTo,
          status: "assigned",
          callRate: number.callRate,
          billBlockRate: number.billBlockRate,
          risk: number.risk,
          enabled: number.enabled
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        console.error('Server error:', result);
        props.freshData();
        toast({
          variant: "destructive",
          title: "Failed to update phone number",
          description: result.message || "An error occurred while updating the phone number.",
        });
        throw new Error('Failed to update phone number');
      }

      refreshData();
      setEditingNumber(null);
      toast({
        title: "Phone number updated",
        description: "Phone number information has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update phone number. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async (number: PhoneNumber) => {
    try {
      const response = await fetch(`/api/numbers?id=${number.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        props.freshData();
        toast({
          variant: "destructive",
          title: "Failed to delete phone number",
          description: result.message || "An error occurred while deleting the phone number.",
        });
        throw new Error('Failed to delete phone number');
      }

      refreshData();
      setDeletingNumber(null);
      toast({
        title: "Phone number deleted",
        description: "Phone number has been successfully removed.",
      });
    } catch (error) {
      console.error('Error deleting phone number:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete phone number. Please try again.",
      });
    }
  };

  const handleCreate = async (newNumber: Omit<PhoneNumber, 'id'>) => {
    try {
      console.log('Creating new phone number:', newNumber);
      const response = await fetch('/api/numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNumber),
      });
      
      console.log('Create phone number response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Create phone number response data:', result);
      
      if (!result.success) {
        props.freshData();
        console.error('Server error:', result);
        toast({
          variant: "destructive",
          title: "Failed to create phone number",
          description: result.message || "An error occurred while creating the phone number.",
        });
        throw new Error('Failed to create phone number');
      }

      refreshData();
      setIsCreateModalOpen(false);
      toast({
        title: "Phone number created",
        description: "New phone number has been successfully created.",
      });
    } catch (error) {
      console.error('Error creating phone number:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create phone number. Please try again.",
      });
    }
  };

  const filteredData = data.filter(number => 
    number.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (searchQuery.toLowerCase() === 'yes' && number.enabled === 1) ||
    (searchQuery.toLowerCase() === 'no' && number.enabled === 0) ||
    number.risk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / numbersPerPage);
  const startIndex = currentPage * numbersPerPage;
  const displayedNumbers = filteredData.slice(startIndex, startIndex + numbersPerPage);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  return (
    <>
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="relative w-80">
          <Input
            type="text"
            placeholder="Search phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 dark:border-zinc-700"
          />
          <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </div>
        {userRole === 'admin' && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <HiPlus className="h-4 w-4 mr-2" />
            Add Number
          </Button>
        )}
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
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Number</p>
                </TableHead>
                {/* <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Assigned To</p>
                </TableHead> */}
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Enabled</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Assigned To</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Call Rate</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Bill Block Rate</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Risk</p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Actions</p>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading...</p>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No numbers found</p>
                  </TableCell>
                </TableRow>
              ) : displayedNumbers.map((number) => (
                <TableRow key={number.id} className="border-b border-zinc-200 dark:border-zinc-800">
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <div className="flex max-w-max items-center">
                      <Checkbox className="me-2.5" />
                    </div>
                  </TableCell>
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{number.number || 'N/A'}</p>
                  </TableCell>
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{number.enabled === 1 ? 'Yes' : 'No'}</p>
                  </TableCell>
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{number.user?.email || 'N/A'}</p>
                  </TableCell>
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">${number.callRate || '0'}</p>
                  </TableCell>
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{number.billBlockRate || '0'}</p>
                  </TableCell>
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{number.risk || 'N/A'}</p>
                  </TableCell>
                  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      {userRole === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => setEditingNumber(number)}
                        >
                          <HiPencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                        onClick={() => setDeletingNumber(number)}
                      >
                        <HiTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-2 flex h-20 w-full items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Showing {data.length} number of records
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                variant="outline"
                className="border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                variant="outline"
                className="border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <EditModal
        number={editingNumber}
        onClose={() => setEditingNumber(null)}
        onSave={handleSaveEdit}
      />

      <DeleteModal
        number={deletingNumber}
        onClose={() => setDeletingNumber(null)}
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

export default NumberListTable;
