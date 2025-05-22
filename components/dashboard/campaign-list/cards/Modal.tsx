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
import { Switch } from '@/components/ui/switch';
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
};

type PhoneNumber = {
  id: number;
  number: string;
  assignedTo: number;
  status: string;
  callRate: number;
  billBlockRate: number;
  risk: string;
  inUse?: boolean;
  enabled?: number;
};

type Target = {
  targetNumber: string;
  dailyCap: boolean;
  dailyCapValue: number;
  priority: number;
  concurrency: number;
  id?: number;
  voipBehavior: boolean;
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
  voipBehavior: boolean;
};

interface EditModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
}

interface DeleteModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onDelete: (campaign: Campaign) => void;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: Omit<Campaign, 'id'>) => void;
}

const usePhoneNumbers = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('auth_token');
        console.log('Auth token found:', !!token);
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Fetching phone numbers...');
        const response = await fetch('/api/numbers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Phone numbers response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Phone numbers API response:', result);

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch phone numbers');
        }

        if (!Array.isArray(result.data)) {
          console.error('Invalid response format:', result);
          throw new Error('Invalid response format: data is not an array');
        }

        console.log('Total phone numbers received:', result.data.length);
        
        // Filter out numbers that are not enabled
        const availableNumbers = result.data.filter((number: PhoneNumber) => {
          console.log('Phone number:', number.number, 'enabled:', number.enabled);
          return number.enabled === 1;
        });
        
        console.log(`Found ${availableNumbers.length} available phone numbers:`, availableNumbers);
        
        setPhoneNumbers(availableNumbers);
      } catch (err) {
        console.error('Error fetching phone numbers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch phone numbers');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, []);

  return { phoneNumbers, loading, error };
};

export function EditModal({ campaign, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Campaign | null>(campaign);
  const [users, setUsers] = useState<User[]>([]);
  const { phoneNumbers, loading: phoneNumbersLoading, error: phoneNumbersError } = usePhoneNumbers();
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [targetFormData, setTargetFormData] = useState<Omit<Target, 'id'>>({
    targetNumber: '',
    dailyCap: true,
    dailyCapValue: 10,
    priority: 1,
    concurrency: 6,
    voipBehavior: true
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Update formData and selectedNumbers when campaign changes
    if (campaign) {
      setFormData(campaign);
      setSelectedNumbers(
        campaign.assignedNumber ? campaign.assignedNumber.split('-') : []
      );
    }
  }, [campaign]);

  useEffect(() => {
    // Fetch users
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
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle adding a target to the local state only (no API call)
  const handleAddTarget = () => {
    if (!targetFormData.targetNumber || !formData) return;

    // Create a new target object for the local state
    const newTarget: Target = {
      ...targetFormData
    };

    // Update only the local state
    setFormData({
      ...formData,
      targets: [...formData.targets, newTarget]
    });

    // Reset target form data
    setTargetFormData({
      targetNumber: '',
      dailyCap: true,
      dailyCapValue: 10,
      priority: 1,
      concurrency: 6,
      voipBehavior: true
    });
  };

  // Handle removing a target from the local state only (no API call)
  const handleRemoveTarget = (index: number) => {
    if (!formData) return;

    // Create a new array without the removed target
    const newTargets = [...formData.targets];
    newTargets.splice(index, 1);

    // Update only the local state
    setFormData({
      ...formData,
      targets: newTargets
    });
  };

  // Only call the API when the form is submitted
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    // Convert selected numbers array to hyphen-separated string
    const updatedFormData = {
      ...formData,
      assignedNumber: selectedNumbers.join('-')
    };
    onSave(updatedFormData);
  };

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Campaign
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Campaign Name
                </label>
                <Input
                  id="name"
                  value={formData?.name}
                  onChange={(e) =>
                    setFormData(
                      formData ? { ...formData, name: e.target.value } : null
                    )
                  }
                  className="dark:border-zinc-700"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="assignedNumber" className="text-sm font-medium">
                  Assigned Numbers
                </label>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <div className="relative">
                      <div
                        className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <div className="flex flex-wrap gap-2">
                          {selectedNumbers.length > 0 ? (
                            selectedNumbers.map((number, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-sm dark:bg-zinc-700"
                              >
                                <span className="text-zinc-900 dark:text-zinc-100">
                                  {number}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newNumbers = selectedNumbers.filter(
                                      (_, i) => i !== index
                                    );
                                    setSelectedNumbers(newNumbers);
                                  }}
                                  className="ml-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Select numbers...
                            </span>
                          )}
                        </div>
                        <svg
                          className={`h-4 w-4 text-zinc-500 transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                          <div className="max-h-60 overflow-y-auto py-1">
                            {phoneNumbers
                              .filter(number => number.enabled === 1)
                              .map((number) => (
                                <div
                                  key={number.id}
                                  className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                                    selectedNumbers.includes(number.number)
                                      ? 'bg-zinc-100 dark:bg-zinc-700'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    if (selectedNumbers.includes(number.number)) {
                                      setSelectedNumbers(
                                        selectedNumbers.filter(
                                          (n) => n !== number.number
                                        )
                                      );
                                    } else {
                                      setSelectedNumbers([
                                        ...selectedNumbers,
                                        number.number
                                      ]);
                                    }
                                  }}
                                >
                                  <span className="text-zinc-900 dark:text-zinc-100">
                                    {number.number}
                                  </span>
                                  {number.status === 'active' && (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
                                      Active
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Click to select multiple numbers
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Campaign Type
                </label>
                <Select
                  value={formData?.type || 'roundrobin'}
                  onValueChange={(value) =>
                    setFormData(
                      formData
                        ? { ...formData, type: value as 'roundrobin' | 'dupe' }
                        : null
                    )
                  }
                >
                  <SelectTrigger className="dark:border-zinc-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-950 text-black dark:text-white">
                    <SelectItem value="roundrobin">Round Robin</SelectItem>
                    <SelectItem value="dupe">Dupe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="status"
                    checked={formData?.status ?? true}
                    onCheckedChange={(checked) =>
                      setFormData(
                        formData ? { ...formData, status: checked } : null
                      )
                    }
                  />
                  <label htmlFor="status" className="text-sm font-medium">
                    {formData?.status ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="voipBehavior" className="text-sm font-medium">
                  VoIP Behavior
                </label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="voipBehavior"
                    checked={formData?.voipBehavior ?? true}
                    onCheckedChange={(checked) =>
                      setFormData(
                        formData ? { ...formData, voipBehavior: checked } : null
                      )
                    }
                  />
                  <label htmlFor="voipBehavior" className="text-sm font-medium">
                    {formData?.voipBehavior ? 'Reject VoIP Calls' : 'Allow VoIP Calls'}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="createdBy" className="text-sm font-medium">
                Created By User
              </label>
              <Select
                value={formData?.createdBy?.toString()}
                onValueChange={(value) =>
                  setFormData(
                    formData
                      ? { ...formData, createdBy: parseInt(value) }
                      : null
                  )
                }
              >
                <SelectTrigger className="dark:border-zinc-700">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 text-black dark:text-white">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-3">Manage Targets</h3>

              {/* Target form inputs */}
              <div className="grid grid-cols-6 gap-4 mb-4 border p-4 rounded-md dark:border-zinc-700">
                <div className="grid gap-2">
                  <label htmlFor="targetNumber" className="text-sm font-medium">
                    Target Number
                  </label>
                  <Input
                    id="targetNumber"
                    value={targetFormData.targetNumber}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        targetNumber: e.target.value
                      })
                    }
                    className="dark:border-zinc-700"
                    placeholder="e.g. 923160566814"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="dailyCapValue" className="text-sm font-medium">
                    Daily Cap Value
                  </label>
                  <Input
                    type="number"
                    id="dailyCapValue"
                    value={targetFormData.dailyCapValue}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        dailyCapValue: parseInt(e.target.value)
                      })
                    }
                    className="dark:border-zinc-700"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Input
                    type="number"
                    id="priority"
                    value={targetFormData.priority}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        priority: parseInt(e.target.value)
                      })
                    }
                    className="dark:border-zinc-700"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="concurrency" className="text-sm font-medium">
                    Concurrency
                  </label>
                  <Input
                    type="number"
                    id="concurrency"
                    value={targetFormData.concurrency}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        concurrency: parseInt(e.target.value)
                      })
                    }
                    className="dark:border-zinc-700"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="voip-behavior" className="text-sm font-medium">
                    VoIP Behavior
                  </label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="voip-behavior"
                      checked={targetFormData.voipBehavior}
                      onCheckedChange={(checked) =>
                        setTargetFormData({ ...targetFormData, voipBehavior: checked })
                      }
                    />
                    <label htmlFor="voip-behavior" className="text-sm font-medium">
                      {targetFormData.voipBehavior ? 'Reject VoIP Calls' : 'Allow VoIP Calls'}
                    </label>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddTarget}
                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Add Target
                  </Button>
                </div>
              </div>

              {/* Target list */}
              <div className="border rounded-md dark:border-zinc-700">
                <div className="grid grid-cols-6 gap-2 font-semibold text-sm p-3 border-b dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                  <div className="col-span-2">Target Number</div>
                  <div className="col-span-1">Daily Cap Value</div>
                  <div className="col-span-1">Priority</div>
                  <div className="col-span-1">Concurrency</div>
                  <div className="col-span-1">Actions</div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {formData?.targets.map((target, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-2 items-center p-3 border-b dark:border-zinc-700 last:border-0"
                    >
                      <div className="col-span-2 font-medium">
                        {target.targetNumber}
                      </div>
                      <div className="col-span-1">{target.dailyCapValue}</div>
                      <div className="col-span-1">{target.priority}</div>
                      <div className="col-span-1">{target.concurrency}</div>
                      <div className="col-span-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveTarget(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {formData?.targets.length === 0 && (
                    <div className="py-6 text-center text-zinc-500">
                      No targets added yet. Add a target using the form above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteModal({ campaign, onClose, onDelete }: DeleteModalProps) {
  return (
    <AlertDialog open={!!campaign} onOpenChange={onClose}>
      <AlertDialogContent className="dark:border-zinc-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">
            Delete Campaign
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the campaign &quot;{campaign?.name}
            &quot;?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:border-zinc-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => campaign && onDelete(campaign)}
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
  const [formData, setFormData] = useState<Omit<Campaign, 'id'>>({
    name: '',
    assignedNumber: '',
    createdBy: 1,
    targets: [],
    type: 'roundrobin',
    status: true,
    voipBehavior: true
  });
  const [users, setUsers] = useState<User[]>([]);
  const { phoneNumbers, loading: phoneNumbersLoading, error: phoneNumbersError } = usePhoneNumbers();
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [targetFormData, setTargetFormData] = useState<Omit<Target, 'id'>>({
    targetNumber: '',
    dailyCap: true,
    dailyCapValue: 10,
    priority: 1,
    concurrency: 6,
    voipBehavior: true
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Reset form data when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Clear the form data when the modal is closed
      setFormData({
        name: '',
        assignedNumber: '',
        createdBy: 1,
        targets: [],
        type: 'roundrobin',
        status: true,
        voipBehavior: true
      });
    }
  }, [isOpen]);

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const authToken = localStorage.getItem('auth_token');
        
        const response = await fetch(`/api/users/list`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        console.log('Users API response:', result);

        if (result.success && Array.isArray(result.data)) {
          console.log(`Found ${result.data.length} users`);
          setUsers(result.data);
          // Automatically select the first user if available
          if (result.data.length > 0) {
            setFormData(prev => ({ ...prev, createdBy: result.data[0].id }));
          }
        } else {
          console.error('Invalid response format:', result);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle adding a target to the local state only (no API call)
  const handleAddTarget = (e: React.MouseEvent) => {
    // Prevent form submission
    e.preventDefault();

    if (!targetFormData.targetNumber) return;

    console.log('Adding target to local state - NO API CALL SHOULD HAPPEN');

    // Create a new target object for the local state
    const newTarget: Target = {
      ...targetFormData
    };

    // Update only the local state
    setFormData({
      ...formData,
      targets: [...formData.targets, newTarget]
    });

    // Reset target form data
    setTargetFormData({
      targetNumber: '',
      dailyCap: true,
      dailyCapValue: 10,
      priority: 1,
      concurrency: 6,
      voipBehavior: true
    });
  };

  // Handle removing a target from the local state only (no API call)
  const handleRemoveTarget = (index: number, e: React.MouseEvent) => {
    // Prevent any form submission
    e.preventDefault();
    e.stopPropagation();

    console.log('Removing target from local state - NO API CALL SHOULD HAPPEN');

    // Create a new array without the removed target
    const newTargets = [...formData.targets];
    newTargets.splice(index, 1);

    // Update only the local state
    setFormData({
      ...formData,
      targets: newTargets
    });
  };

  // Only call the API when the form is submitted
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted - NOW the API call should happen');
    // Convert selected numbers array to hyphen-separated string
    const updatedFormData = {
      ...formData,
      assignedNumber: selectedNumbers.join('-')
    };
    onCreate(updatedFormData);
  };

  // Handle modal close without creating
  const handleDialogClose = () => {
    console.log('Dialog closing without creating');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create New Campaign
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="create-name" className="text-sm font-medium">
                  Campaign Name
                </label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="dark:border-zinc-700"
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="create-assignedNumber"
                  className="text-sm font-medium"
                >
                  Assigned Numbers
                </label>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <div className="relative">
                      <div
                        className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <div className="flex flex-wrap gap-2">
                          {selectedNumbers.length > 0 ? (
                            selectedNumbers.map((number, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-sm dark:bg-zinc-700"
                              >
                                <span className="text-zinc-900 dark:text-zinc-100">
                                  {number}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newNumbers = selectedNumbers.filter(
                                      (_, i) => i !== index
                                    );
                                    setSelectedNumbers(newNumbers);
                                  }}
                                  className="ml-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Select numbers...
                            </span>
                          )}
                        </div>
                        <svg
                          className={`h-4 w-4 text-zinc-500 transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                          <div className="max-h-60 overflow-y-auto py-1">
                            {phoneNumbers
                              .filter(number => number.enabled === 1)
                              .map((number) => (
                                <div
                                  key={number.id}
                                  className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                                    selectedNumbers.includes(number.number)
                                      ? 'bg-zinc-100 dark:bg-zinc-700'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    if (selectedNumbers.includes(number.number)) {
                                      setSelectedNumbers(
                                        selectedNumbers.filter(
                                          (n) => n !== number.number
                                        )
                                      );
                                    } else {
                                      setSelectedNumbers([
                                        ...selectedNumbers,
                                        number.number
                                      ]);
                                    }
                                  }}
                                >
                                  <span className="text-zinc-900 dark:text-zinc-100">
                                    {number.number}
                                  </span>
                                  {number.status === 'active' && (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
                                      Active
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="create-type" className="text-sm font-medium">
                  Campaign Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as 'roundrobin' | 'dupe'
                    })
                  }
                >
                  <SelectTrigger className="dark:border-zinc-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-950 text-black dark:text-white">
                    <SelectItem value="roundrobin">Round Robin</SelectItem>
                    <SelectItem value="dupe">Dupe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="create-status" className="text-sm font-medium">
                  Status
                </label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="create-status"
                    checked={formData.status}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked })
                    }
                  />
                  <label
                    htmlFor="create-status"
                    className="text-sm font-medium"
                  >
                    {formData.status ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="create-voipBehavior" className="text-sm font-medium">
                  VoIP Behavior
                </label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="create-voipBehavior"
                    checked={formData.voipBehavior}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, voipBehavior: checked })
                    }
                  />
                  <label
                    htmlFor="create-voipBehavior"
                    className="text-sm font-medium"
                  >
                    {formData.voipBehavior ? 'Reject VoIP Calls' : 'Allow VoIP Calls'}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-createdBy" className="text-sm font-medium">
                Created By User
              </label>
              <Select
                value={formData.createdBy.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, createdBy: parseInt(value) })
                }
              >
                <SelectTrigger className="dark:border-zinc-700">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 text-black dark:text-white">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-3">Manage Targets</h3>

              {/* Target form inputs */}
              <div className="grid grid-cols-6 gap-4 mb-4 border p-4 rounded-md dark:border-zinc-700">
                <div className="grid gap-2">
                  <label htmlFor="targetNumber" className="text-sm font-medium">
                    Target Number
                  </label>
                  <Input
                    id="targetNumber"
                    value={targetFormData.targetNumber}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        targetNumber: e.target.value
                      })
                    }
                    className="dark:border-zinc-700"
                    placeholder="e.g. 923160566814"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="dailyCapValue" className="text-sm font-medium">
                    Daily Cap Value
                  </label>
                  <Input
                    type="number"
                    id="dailyCapValue"
                    value={targetFormData.dailyCapValue}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        dailyCapValue: parseInt(e.target.value)
                      })
                    }
                    className="dark:border-zinc-700"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Input
                    type="number"
                    id="priority"
                    value={targetFormData.priority}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        priority: parseInt(e.target.value)
                      })
                    }
                    className="dark:border-zinc-700"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="concurrency" className="text-sm font-medium">
                    Concurrency
                  </label>
                  <Input
                    type="number"
                    id="concurrency"
                    value={targetFormData.concurrency}
                    onChange={(e) =>
                      setTargetFormData({
                        ...targetFormData,
                        concurrency: parseInt(e.target.value)
                      })
                    }
                    className="dark:border-zinc-700"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="voip-behavior" className="text-sm font-medium">
                    VoIP Behavior
                  </label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="voip-behavior"
                      checked={targetFormData.voipBehavior}
                      onCheckedChange={(checked) =>
                        setTargetFormData({ ...targetFormData, voipBehavior: checked })
                      }
                    />
                    <label htmlFor="voip-behavior" className="text-sm font-medium">
                      {targetFormData.voipBehavior ? 'Reject VoIP Calls' : 'Allow VoIP Calls'}
                    </label>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddTarget}
                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Add Target
                  </Button>
                </div>
              </div>

              {/* Target list */}
              <div className="border rounded-md dark:border-zinc-700">
                <div className="grid grid-cols-6 gap-2 font-semibold text-sm p-3 border-b dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                  <div className="col-span-2">Target Number</div>
                  <div className="col-span-1">Daily Cap Value</div>
                  <div className="col-span-1">Priority</div>
                  <div className="col-span-1">Concurrency</div>
                  <div className="col-span-1">Actions</div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {formData.targets.map((target, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-2 items-center p-3 border-b dark:border-zinc-700 last:border-0"
                    >
                      <div className="col-span-2 font-medium">
                        {target.targetNumber}
                      </div>
                      <div className="col-span-1">{target.dailyCapValue}</div>
                      <div className="col-span-1">{target.priority}</div>
                      <div className="col-span-1">{target.concurrency}</div>
                      <div className="col-span-1">
                        <Button
                          type="button" // Explicitly set button type to prevent form submission
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleRemoveTarget(index, e)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {formData.targets.length === 0 && (
                    <div className="py-6 text-center text-zinc-500">
                      No targets added yet. Add a target using the form above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="submit"
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create Campaign
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              className="dark:border-zinc-700"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
