'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState, useEffect } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  trunk?: string;
  status: boolean;
};

type Trunk = {
  id: number;
  trunkName: string | null;
  serverIp: string;
  inboundEnabled: number;
  outboundEnabled: number;
  createdAt: string;
  secret: string;
  username: string;
  ipAuth: number;
  status: number;
  type: string;
  prefix: string | null;
};

interface EditModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

interface DeleteModalProps {
  user: User | null;
  onClose: () => void;
  onDelete: (user: User) => void;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (user: Omit<User, 'id'>) => void;
}

// Function to fetch trunks
const fetchTrunks = async (): Promise<Trunk[]> => {
  try {
    const response = await fetch('https://dialo.dollu.com/rest/trunks');
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching trunks:', error);
    return [];
  }
};

export function EditModal({ user, onClose, onSave }: EditModalProps) {
  const [role, setRole] = useState<string>(user?.role);
  const [trunks, setTrunks] = useState<Trunk[]>([]);
  const [selectedTrunk, setSelectedTrunk] = useState<string>(user?.trunk || '');
  const [status, setStatus] = useState<boolean>(user?.status ?? true);

  useEffect(() => {
    const getTrunks = async () => {
      const trunkData = await fetchTrunks();
      setTrunks(trunkData);
      if (user?.trunk && !selectedTrunk) {
        setSelectedTrunk(user.trunk);
      }
    };
    getTrunks();
  }, [user, selectedTrunk]);

  useEffect(() => {
    if (user) {
      setStatus(user.status ?? true);
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement;

    const updatedUser = {
      ...user,
      name: nameInput.value,
      role: role,
      email: emailInput.value,
      password: passwordInput.value || user.password,
      trunk: selectedTrunk || null,
      status: status
    };

    onSave(updatedUser);
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              defaultValue={user?.name}
              className="dark:border-zinc-700"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Select defaultValue={user?.role || 'user'} onValueChange={setRole}>
              <SelectTrigger id="role" className="dark:border-zinc-700">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="dark:border-zinc-700 dark:bg-zinc-950">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="trunk" className="text-sm font-medium">
              Trunk
            </label>
            <Select value={selectedTrunk} onValueChange={setSelectedTrunk}>
              <SelectTrigger id="trunk" className="dark:border-zinc-700">
                <SelectValue placeholder="Select a trunk" />
              </SelectTrigger>
              <SelectContent className="dark:border-zinc-700 dark:bg-zinc-950">
                {trunks.map((trunk) => (
                  <SelectItem key={trunk.id} value={trunk.trunkName}>
                    {trunk.trunkName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={status ? 'active' : 'inactive'}
              onValueChange={(value) => setStatus(value === 'active')}
            >
              <SelectTrigger id="status" className="dark:border-zinc-700">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="dark:border-zinc-700 dark:bg-zinc-950">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              defaultValue={user?.email}
              className="dark:border-zinc-700"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password (leave empty to keep current)
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              className="dark:border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            onClick={handleSave}
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

export function DeleteModal({ user, onClose, onDelete }: DeleteModalProps) {
  return (
    <AlertDialog open={!!user} onOpenChange={onClose}>
      <AlertDialogContent className="dark:border-zinc-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this user ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:border-zinc-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => user && onDelete(user)}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CreateModal({ isOpen, onClose, onCreate }: CreateModalProps) {
  const [role, setRole] = useState<string>('user');
  const [trunks, setTrunks] = useState<Trunk[]>([]);
  const [selectedTrunk, setSelectedTrunk] = useState<string>('');
  const [status, setStatus] = useState<boolean>(true);

  useEffect(() => {
    const getTrunks = async () => {
      const trunkData = await fetchTrunks();
      setTrunks(trunkData);
    };
    getTrunks();
  }, []);

  const handleCreate = () => {
    const nameInput = document.getElementById(
      'create-name'
    ) as HTMLInputElement;
    const emailInput = document.getElementById(
      'create-email'
    ) as HTMLInputElement;
    const passwordInput = document.getElementById(
      'create-password'
    ) as HTMLInputElement;

    const newUser = {
      name: nameInput.value,
      role: role,
      email: emailInput.value,
      password: passwordInput.value,
      trunk: selectedTrunk || null,
      status: status
    };

    onCreate(newUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create New User
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <label htmlFor="create-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="create-name"
              className="dark:border-zinc-700"
              placeholder="Enter name"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="create-role" className="text-sm font-medium">
              Role
            </label>
            <Select defaultValue="user" onValueChange={setRole}>
              <SelectTrigger id="create-role" className="dark:border-zinc-700">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="dark:border-zinc-700 dark:bg-zinc-950">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="create-trunk" className="text-sm font-medium">
              Trunk
            </label>
            <Select value={selectedTrunk} onValueChange={setSelectedTrunk}>
              <SelectTrigger id="create-trunk" className="dark:border-zinc-700">
                <SelectValue placeholder="Select a trunk" />
              </SelectTrigger>
              <SelectContent className="dark:border-zinc-700 dark:bg-zinc-950">
                {trunks.map((trunk) => (
                  <SelectItem key={trunk.id} value={trunk.trunkName}>
                    {trunk.trunkName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="create-status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={status ? 'active' : 'inactive'}
              onValueChange={(value) => setStatus(value === 'active')}
            >
              <SelectTrigger
                id="create-status"
                className="dark:border-zinc-700"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="dark:border-zinc-700 dark:bg-zinc-950">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="create-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="create-email"
              className="dark:border-zinc-700"
              placeholder="Enter email"
              type="email"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="create-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="create-password"
              type="password"
              className="dark:border-zinc-700"
              placeholder="Enter password"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            onClick={handleCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create User
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
