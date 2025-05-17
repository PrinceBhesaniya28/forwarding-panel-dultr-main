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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

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
  enabled: number;
};

type EditModalProps = {
  number: PhoneNumber | null;
  onClose: () => void;
  onSave: (number: PhoneNumber) => void;
};

type DeleteModalProps = {
  number: PhoneNumber | null;
  onClose: () => void;
  onDelete: (number: PhoneNumber) => void;
};

type CreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (number: Omit<PhoneNumber, 'id'>) => void;
};

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
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
          setUsers(result);
        } else if (result.data && Array.isArray(result.data)) {
          setUsers(result.data);
        } else {
          setError('Invalid response format');
          console.error('Expected users array but got:', result);
        }
      } catch (error) {
        setError('Failed to fetch users');
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export function EditModal({ number, onClose, onSave }: EditModalProps) {
  const { users, loading, error } = useUsers();
  
  if (!number) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSave({
      ...number,
      number: formData.get('number') as string,
      assignedTo: parseInt(formData.get('assignedTo') as string),
      status: "assigned", // Default status value
      callRate: parseFloat(formData.get('callRate') as string),
      billBlockRate: parseFloat(formData.get('billBlockRate') as string),
      risk: formData.get('risk') as string,
      enabled: formData.get('enabled') === 'true' ? 1 : 0,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Phone Number</DialogTitle>
          <DialogDescription>Make changes to the phone number here. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input id="number" name="number" defaultValue={number.number} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select name="assignedTo" defaultValue={number?.assignedTo?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>Loading users...</SelectItem>
                  ) : error ? (
                    <SelectItem value="" disabled>Error loading users</SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="" disabled>No users found</SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enabled">Enabled</Label>
              <Select name="enabled" defaultValue={number.enabled === 1 ? "true" : "false"}>
                <SelectTrigger>
                  <SelectValue placeholder="Is number enabled?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="callRate">Call Rate</Label>
              <Input id="callRate" name="callRate" type="number" step="0.01" defaultValue={number.callRate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billBlockRate">Bill Block Rate</Label>
              <Select name="billBlockRate" defaultValue={number.billBlockRate.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bill block rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6/6</SelectItem>
                  <SelectItem value="60">60/60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk">Risk Level</Label>
              <Select name="risk" defaultValue={number.risk}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteModal({ number, onClose, onDelete }: DeleteModalProps) {
  if (!number) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Phone Number</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the phone number {number.number}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onDelete(number)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateModal({ isOpen, onClose, onCreate }: CreateModalProps) {
  const { users, loading, error } = useUsers();
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onCreate({
      number: formData.get('number') as string,
      assignedTo: parseInt(formData.get('assignedTo') as string),
      status: "assigned", // Default status value
      callRate: parseFloat(formData.get('callRate') as string),
      billBlockRate: parseFloat(formData.get('billBlockRate') as string),
      risk: formData.get('risk') as string,
      enabled: formData.get('enabled') === 'true' ? 1 : 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Phone Number</DialogTitle>
          <DialogDescription>Add a new phone number to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input id="number" name="number" placeholder="Enter phone number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select name="assignedTo">
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>Loading users...</SelectItem>
                  ) : error ? (
                    <SelectItem value="" disabled>Error loading users</SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="" disabled>No users found</SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enabled">Enabled</Label>
              <Select name="enabled" defaultValue="true">
                <SelectTrigger>
                  <SelectValue placeholder="Is number enabled?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="callRate">Call Rate</Label>
              <Input id="callRate" name="callRate" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billBlockRate">Bill Block Rate</Label>
              <Select name="billBlockRate" defaultValue="6">
                <SelectTrigger>
                  <SelectValue placeholder="Select bill block rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6/6</SelectItem>
                  <SelectItem value="60">60/60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk">Risk Level</Label>
              <Select name="risk" defaultValue="low">
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Phone Number</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

