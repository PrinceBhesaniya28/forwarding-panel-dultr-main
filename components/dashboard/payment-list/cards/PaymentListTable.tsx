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

type Payment = {
  id: number;
  userId: number;
  phoneNumberId: number;
  amount: number;
  status: string;
  transactionId: string;
  user: {
    balance: number;
  };
};

function PaymentListTable(props: { freshData: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const paymentsPerPage = 6;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching payments from API...');
        const result = await getWithAuth<{ success: boolean; data: Payment[] }>(
          '/api/payments'
        );
        console.log('API response data:', result);

        if (result.success && Array.isArray(result.data)) {
          console.log('Setting payment data:', result.data);
          setData(result.data);
        } else {
          console.error(
            'Expected success response with data array but got:',
            result
          );
          toast({
            variant: 'destructive',
            title: 'Error fetching payments',
            description: 'Failed to load payment data. Please try again later.'
          });
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
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

    fetchPayments();
  }, [toast, refreshTrigger]);

  const handleSaveEdit = async (payment: Payment) => {
    try {
      console.log('Updating payment:', payment);
      const response = await fetch('/api/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: payment.id,
          userId: payment.userId,
          phoneNumberId: payment.phoneNumberId,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      refreshData();
      setEditingPayment(null);
      props.freshData();
      toast({
        title: 'Payment updated',
        description: 'Payment information has been successfully updated.'
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update payment. Please try again.'
      });
    }
  };

  const handleConfirmDelete = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/payments?id=${payment.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      refreshData();
      setDeletingPayment(null);
      toast({
        title: 'Payment deleted',
        description: 'Payment has been successfully removed.'
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      props.freshData();
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete payment. Please try again.'
      });
    }
  };

  const handleCreate = async (newPayment: Omit<Payment, 'id'>) => {
    try {
      console.log('Creating new payment:', newPayment);
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPayment)
      });

      console.log('Create payment response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Create payment response data:', result);

      refreshData();
      setIsCreateModalOpen(false);
      props.freshData();
      toast({
        title: 'Payment created',
        description: 'New payment has been successfully created.'
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create payment. Please try again.'
      });
    }
  };

  // Filter data based on search query
  const filteredData = data.filter(
    (payment) =>
      payment.transactionId
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      payment.status?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      payment.userId?.toString()?.includes(searchQuery) ||
      payment.phoneNumberId?.toString()?.includes(searchQuery)
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / paymentsPerPage);
  const startIndex = currentPage * paymentsPerPage;
  const displayedPayments = filteredData.slice(
    startIndex,
    startIndex + paymentsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleEditClick = (payment: Payment) => {
    console.log('Setting edit payment with balance:', payment?.user?.balance);
    setEditingPayment(payment);
  };

  return (
    <>
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="relative w-80">
          <Input
            type="text"
            placeholder="Search payments..."
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
          Add Payment
        </Button>
      </div>
      <Card className="h-full w-full p-0 dark:border-zinc-800 sm:overflow-auto">
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table>
            <TableHeader className="border-b-[1px] border-zinc-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="pl-5">
                  <Checkbox className="me-2.5" />
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Transaction ID
                  </p>
                </TableHead>
                {/* <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">User ID</p>
                </TableHead> */}
                {/* 
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">User Balance</p>
                </TableHead>
              */}
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Amount
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Status
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
              ) : displayedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      No payments found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                displayedPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex max-w-max items-center">
                        <Checkbox className="me-2.5" />
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {payment.transactionId || 'N/A'}
                      </p>
                    </TableCell>
                    {/* <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{payment.userId || 'N/A'}</p>
                  </TableCell> */}
                    {/*  <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {payment?.user?.balance || 'N/A'}
                      </p>
                    </TableCell> */}
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        ${payment.amount || '0'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {payment.status || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => handleEditClick(payment)}
                        >
                          <HiPencil className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                          onClick={() => setDeletingPayment(payment)}
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
        </div>
      </Card>

      <EditModal
        payment={editingPayment}
        onClose={() => setEditingPayment(null)}
        onSave={handleSaveEdit}
        userBalance={editingPayment?.user?.balance}
      />

      <DeleteModal
        payment={deletingPayment}
        onClose={() => setDeletingPayment(null)}
        onDelete={handleConfirmDelete}
      />

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
        userBalance={undefined}
      />
    </>
  );
}

export default PaymentListTable;
