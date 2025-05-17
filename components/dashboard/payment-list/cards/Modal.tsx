'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  email: string;
  full_name: string;
};

type PhoneNumber = {
  id: number;
  number: string;
  assignedTo: number;
  status: string;
  callRate: number;
  billBlockRate: number;
  risk: string;
};

type Payment = {
  id: number;
  userId: number;
  amount: number;
  status: string;
  transactionId: string;
};

interface EditModalProps {
  payment: Payment | null;
  onClose: () => void;
  onSave: (payment: Payment) => void;
  userBalance?: number;
}

interface DeleteModalProps {
  payment: Payment | null;
  onClose: () => void;
  onDelete: (payment: Payment) => void;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payment: Omit<Payment, 'id'>) => void;
  userBalance?: number;
}

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const authToken = localStorage.getItem('auth_token');
        
        const response = await fetch(`/api/users/`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        console.log('Users API response:', result);

        if (Array.isArray(result)) {
          // The API returns the users directly as an array
          console.log(`Found ${result.length} users in direct array`);
          setUsers(result);
        } else if (result.data && Array.isArray(result.data)) {
          // Fallback if API returns { data: [...] }
          console.log(`Found ${result.data.length} users in result.data`);
          setUsers(result.data);
        } else {
          console.error('Expected users array but got:', result);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, [toast]);

  return users;
}

function usePhoneNumbers() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        
        const response = await fetch(`/api/numbers`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Phone numbers API response:', data);
        
        if (data.data && Array.isArray(data.data)) {
          console.log('Using data from result.data (array)');
          setPhoneNumbers(data.data);
        } else if (Array.isArray(data)) {
          console.log('Using data directly (array)');
          setPhoneNumbers(data);
        } else {
          console.error('Expected phone numbers array but got:', data);
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Failed to fetch phone numbers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load phone numbers. Please try again later.",
        });
        // Set a dummy phone number for testing
        // setPhoneNumbers([
        //   { id: 1, number: "+1234567890", assignedTo: 1, status: "active", callRate: 0.01, billBlockRate: 60, risk: "low" }
        // ]);
      }
    };

    fetchPhoneNumbers();
  }, [toast]);

  return phoneNumbers;
}

export function EditModal({ payment, onClose, onSave, userBalance }: EditModalProps) {
  const users = useUsers();
  const phoneNumbers = usePhoneNumbers();
  
  // State to track user selection
  const [selectedUserId, setSelectedUserId] = useState<string>(payment?.userId?.toString() || '');
  
  // Log userBalance to debug
  useEffect(() => {
    console.log("EditModal received userBalance:", userBalance);
  }, [userBalance]);
  
  // Update selectedUserId when payment changes
  useEffect(() => {
    if (payment?.userId) {
      setSelectedUserId(payment.userId.toString());
    }
  }, [payment?.userId]);
  
  const handleSave = () => {
    console.log('handleSave called', payment);
    
    const amountInput = document.getElementById('amount') as HTMLInputElement;
    
    const updatedPayment = {
      ...payment,
      userId: parseInt(selectedUserId || '0'),
      amount: parseFloat(amountInput?.value || '0'),
      status: payment?.status || 'pending', // Use existing status
      transactionId: payment?.transactionId || '', // Keep original transaction ID
    };
    
    console.log('Sending updated payment:', updatedPayment);
    onSave(updatedPayment);
  };

  return (
    <Dialog open={!!payment} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">Edit Payment</DialogTitle>
            {userBalance !== undefined && (
              <div className="">
                <span className="text-sm font-medium">Balance: <span className="text-green-600 dark:text-green-400">${userBalance.toFixed(2)}</span></span>
              </div>
            )}
          </div>
          <DialogDescription>Make changes to the payment details here.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <label htmlFor="userId" className="text-sm font-medium">
              User
            </label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              name="userId"
            >
              <SelectTrigger id="userId" className="w-full dark:border-zinc-700">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="dark:bg-background dark:border-zinc-700">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className="grid gap-2">
            <label htmlFor="phoneNumberId" className="text-sm font-medium">
              Phone Number
            </label>
            <select 
              id="phoneNumberId"
              defaultValue={payment?.phoneNumberId?.toString()}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              {phoneNumbers.map((phoneNumber) => (
                <option key={phoneNumber.id} value={phoneNumber.id.toString()}>
                  {phoneNumber.number} (ID: {phoneNumber.id})
                </option>
              ))}
            </select>
          </div> */}
          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              defaultValue={payment?.amount}
              className="dark:border-zinc-700"
            />
          </div>
          {/* <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select 
              id="status"
              defaultValue={payment?.status}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="transactionId" className="text-sm font-medium">
              Transaction ID (Read-only)
            </label>
            <Input
              id="transactionId"
              defaultValue={payment?.transactionId}
              className="dark:border-zinc-700 bg-gray-100 dark:bg-gray-800"
              readOnly
            />
          </div> */}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            onClick={() => handleSave()}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Save changes
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="dark:border-zinc-700">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteModal({ payment, onClose, onDelete }: DeleteModalProps) {
  return (
    <AlertDialog open={!!payment} onOpenChange={onClose}>
      <AlertDialogContent className="dark:border-zinc-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">
            Delete Payment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete payment with transaction ID: {payment?.transactionId}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:border-zinc-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => payment && onDelete(payment)}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CreateModal({ isOpen, onClose, onCreate, userBalance }: CreateModalProps) {
  const users = useUsers();
  // const phoneNumbers = usePhoneNumbers(); // Removed as not needed
  
  // Generate a random transaction ID when the modal opens
  const [transactionId, setTransactionId] = useState('');
  // State to track user selection
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Log userBalance to debug
  useEffect(() => {
    console.log("CreateModal received userBalance:", userBalance);
  }, [userBalance]);
  
  useEffect(() => {
    if (isOpen) {
      // Reset selections when modal opens
      setSelectedUserId('');
      // Generate a random transaction ID with prefix "TXN-" followed by timestamp and random digits
      const timestamp = new Date().getTime().toString().slice(-6);
      const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setTransactionId(`TXN-${timestamp}-${randomDigits}`);
    }
  }, [isOpen]);
  
  const handleCreate = () => {
    const amountInput = document.getElementById('create-amount') as HTMLInputElement;
    
    // Check if no user was selected
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }
    
    const newPayment = {
      userId: parseInt(selectedUserId),
      amount: parseFloat(amountInput.value),
      status: 'pending', // Set default status to pending
      transactionId: transactionId,
    };
    
    onCreate(newPayment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">Create New Payment</DialogTitle>
            {userBalance !== undefined && (
              <div className="">
                <span className="text-sm font-medium">Balance: <span className="text-green-600 dark:text-green-400">${userBalance.toFixed(2)}</span></span>
              </div>
            )}
          </div>
          <DialogDescription>Add a new payment to the system.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <label htmlFor="create-userId" className="text-sm font-medium">
              User
            </label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              name="create-userId"
            >
              <SelectTrigger id="create-userId" className="w-full dark:border-zinc-700">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="dark:bg-background dark:border-zinc-700">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className="grid gap-2">
            <label htmlFor="create-phoneNumberId" className="text-sm font-medium">
              Phone Number
            </label>
            <select
              id="create-phoneNumberId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              <option value="">Select a phone number</option>
              {phoneNumbers.map((phoneNumber) => (
                <option key={phoneNumber.id} value={phoneNumber.id.toString()}>
                  {phoneNumber.number} (ID: {phoneNumber.id})
                </option>
              ))}
            </select>
          </div> */}
          <div className="grid gap-2">
            <label htmlFor="create-amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="create-amount"
              type="number"
              step="0.01"
              className="dark:border-zinc-700"
              placeholder="Enter amount"
            />
          </div>
          {/* <div className="grid gap-2">
            <label htmlFor="create-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="create-status"
              defaultValue="pending"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="create-transactionId" className="text-sm font-medium">
              Transaction ID (Auto-generated)
            </label>
            <Input
              id="create-transactionId"
              value={transactionId}
              className="dark:border-zinc-700 bg-gray-100 dark:bg-gray-800"
              readOnly
            />
          </div> */}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            onClick={handleCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create Payment
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="dark:border-zinc-700">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

