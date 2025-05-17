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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
};

// Target type for use in the AddTargetModal
export type TargetRecord = {
  id?: number;
  targetNumber: string;
  campaignId?: number;
  campaignName: string;
  priority?: number;
  dailyCap?: number;
  dailyCapValue: number;
  concurrency: number;
  dialDuration?: number;
  today: number;
  currentConcurrency: number;
  status?: number; // Added status field: 1 for enabled, 0 for disabled
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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: Record<string, string>) => void;
}

interface AddTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (target: Omit<TargetRecord, 'today'>) => void;
  campaigns: { id: string; name: string }[];
}

interface EditTargetModalProps {
  target: TargetRecord | null;
  onClose: () => void;
  onSave: (target: TargetRecord) => void;
  campaigns: { id: string; name: string }[];
}

export function EditModal({ user, onClose, onSave }: EditModalProps) {
  const handleSave = () => {
    if (!user) return;
    
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const roleInput = document.getElementById('role') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    const updatedUser = {
      ...user,
      name: nameInput.value,
      role: roleInput.value,
      email: emailInput.value,
      password: passwordInput.value || user.password,
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
            <Input
              id="role"
              defaultValue={user?.role}
              className="dark:border-zinc-700"
            />
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
  const handleCreate = () => {
    const nameInput = document.getElementById('create-name') as HTMLInputElement;
    const roleInput = document.getElementById('create-role') as HTMLInputElement;
    const emailInput = document.getElementById('create-email') as HTMLInputElement;
    const passwordInput = document.getElementById('create-password') as HTMLInputElement;
    
    const newUser = {
      name: nameInput.value,
      role: roleInput.value,
      email: emailInput.value,
      password: passwordInput.value,
    };
    
    onCreate(newUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New User</DialogTitle>
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
            <Input
              id="create-role"
              className="dark:border-zinc-700"
              placeholder="Enter role"
            />
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

export function AddTargetModal({ isOpen, onClose, onAdd, campaigns }: AddTargetModalProps) {
  const [targetNumber, setTargetNumber] = useState('');
  const [campaignId, setCampaignId] = useState<number | undefined>(undefined);
  const [campaignName, setCampaignName] = useState('');
  const [dailyCapValue, setDailyCapValue] = useState<number>(10);
  const [concurrency, setConcurrency] = useState<number>(1);
  const [priority, setPriority] = useState<number>(1);
  const [dailyCap, setDailyCap] = useState<number>(1);
  const [dialDuration, setDialDuration] = useState<number>(30); // Default 30 seconds

  // Update campaign name when campaign id changes
  const handleCampaignChange = (id: string) => {
    const campaignId = parseInt(id);
    setCampaignId(campaignId);
    
    // Find the campaign name from the id
    const campaign = campaigns.find(c => parseInt(c.id) === campaignId);
    if (campaign) {
      setCampaignName(campaign.name);
    }
  };

  const handleAdd = () => {
    // Validate inputs
    if (!targetNumber || !campaignId || dailyCapValue <= 0 || concurrency <= 0) {
      return;
    }
    
    const newTarget: Omit<TargetRecord, 'today'> = {
      targetNumber,
      campaignId,
      campaignName,
      priority,
      dailyCap,
      dailyCapValue,
      concurrency,
      dialDuration,
      currentConcurrency: 0
    };
    
    onAdd(newTarget);
    
    // Reset form
    setTargetNumber('');
    setCampaignId(undefined);
    setCampaignName('');
    setDailyCapValue(10);
    setConcurrency(1);
    setPriority(1);
    setDailyCap(1);
    setDialDuration(30);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Target</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="target-number" className="text-sm font-medium">
              Target Number
            </label>
            <Input
              id="target-number"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
              className="dark:border-zinc-700"
              placeholder="Enter target number"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="campaign" className="text-sm font-medium">
              Campaign
            </label>
            <Select
              value={campaignId?.toString() || ""}
              onValueChange={handleCampaignChange}
            >
              <SelectTrigger className="w-full dark:border-zinc-700">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Input
                id="priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="dial-duration" className="text-sm font-medium">
                Timeout
              </label>
              <Input
                id="dial-duration"
                type="number"
                value={dialDuration}
                onChange={(e) => setDialDuration(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="daily-cap-value" className="text-sm font-medium">
                Daily Cap Value
              </label>
              <Input
                id="daily-cap-value"
                type="number"
                value={dailyCapValue}
                onChange={(e) => setDailyCapValue(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="concurrency" className="text-sm font-medium">
                Concurrency
              </label>
              <Input
                id="concurrency"
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            onClick={handleAdd}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Target
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

export function EditTargetModal({ target, onClose, onSave, campaigns }: EditTargetModalProps) {
  const [targetNumber, setTargetNumber] = useState('');
  const [campaignId, setCampaignId] = useState<number | undefined>(undefined);
  const [campaignName, setCampaignName] = useState('');
  const [dailyCapValue, setDailyCapValue] = useState<number>(10);
  const [concurrency, setConcurrency] = useState<number>(1);
  const [priority, setPriority] = useState<number>(1);
  const [dailyCap, setDailyCap] = useState<number>(1);
  const [dialDuration, setDialDuration] = useState<number>(30); // Default 30 seconds

  // Initialize form with target data when it changes
  useEffect(() => {
    if (target) {
      setTargetNumber(target.targetNumber);
      setCampaignId(target.campaignId);
      setCampaignName(target.campaignName);
      setDailyCapValue(target.dailyCapValue);
      setConcurrency(target.concurrency);
      setPriority(target.priority || 1);
      setDailyCap(target.dailyCap || 1);
      setDialDuration(target.dialDuration || 30);
    }
  }, [target]);

  // Update campaign name when campaign id changes
  const handleCampaignChange = (id: string) => {
    const campaignId = parseInt(id);
    setCampaignId(campaignId);
    
    // Find the campaign name from the id
    const campaign = campaigns.find(c => parseInt(c.id) === campaignId);
    if (campaign) {
      setCampaignName(campaign.name);
    }
  };

  const handleSave = () => {
    if (!target || !targetNumber || !campaignId || dailyCapValue <= 0 || concurrency <= 0) {
      return;
    }
    
    const updatedTarget: TargetRecord = {
      ...target,
      targetNumber,
      campaignId,
      campaignName,
      priority,
      dailyCap,
      dailyCapValue,
      concurrency,
      dialDuration,
    };
    
    onSave(updatedTarget);
  };

  return (
    <Dialog open={!!target} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Target</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="edit-target-number" className="text-sm font-medium">
              Target Number
            </label>
            <Input
              id="edit-target-number"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
              className="dark:border-zinc-700"
              placeholder="Enter target number"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="edit-campaign" className="text-sm font-medium">
              Campaign
            </label>
            <Select
              value={campaignId?.toString() || ""}
              onValueChange={handleCampaignChange}
            >
              <SelectTrigger id="edit-campaign" className="w-full dark:border-zinc-700">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="edit-priority" className="text-sm font-medium">
                Priority
              </label>
              <Input
                id="edit-priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-dial-duration" className="text-sm font-medium">
                Timeout
              </label>
              <Input
                id="edit-dial-duration"
                type="number"
                value={dialDuration}
                onChange={(e) => setDialDuration(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="edit-daily-cap-value" className="text-sm font-medium">
                Daily Cap Value
              </label>
              <Input
                id="edit-daily-cap-value"
                type="number"
                value={dailyCapValue}
                onChange={(e) => setDailyCapValue(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-concurrency" className="text-sm font-medium">
                Concurrency
              </label>
              <Input
                id="edit-concurrency"
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value))}
                min={1}
                className="dark:border-zinc-700"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            onClick={handleSave}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Save Changes
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

