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
  role: string;
};

// interface EditModalProps {
//   user: User | null;
//   onClose: () => void;
//   onSave: (user: User) => void;
// }

// interface DeleteModalProps {
//   user: User | null;
//   onClose: () => void;
//   onDelete: (user: User) => void;
// }

// interface CreateModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onCreate: (user: Omit<User, 'id'>) => void;
// }

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: Record<string, string>) => void;
}

// export function EditModal({ user, onClose, onSave }: EditModalProps) {
//   const handleSave = () => {
//     if (!user) return;
    
//     const nameInput = document.getElementById('name') as HTMLInputElement;
//     const roleInput = document.getElementById('role') as HTMLInputElement;
//     const emailInput = document.getElementById('email') as HTMLInputElement;
//     const passwordInput = document.getElementById('password') as HTMLInputElement;
    
//     const updatedUser = {
//       ...user,
//       name: nameInput.value,
//       role: roleInput.value,
//       email: emailInput.value,
//       password: passwordInput.value || user.password,
//     };
    
//     onSave(updatedUser);
//   };

//   return (
//     <Dialog open={!!user} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
//         </DialogHeader>
//         <div className="grid gap-2">
//           <div className="grid gap-2">
//             <label htmlFor="name" className="text-sm font-medium">
//               Name
//             </label>
//             <Input
//               id="name"
//               defaultValue={user?.name}
//               className="dark:border-zinc-700"
//             />
//           </div>
//           <div className="grid gap-2">
//             <label htmlFor="role" className="text-sm font-medium">
//               Role
//             </label>
//             <Input
//               id="role"
//               defaultValue={user?.role}
//               className="dark:border-zinc-700"
//             />
//           </div>
//           <div className="grid gap-2">
//             <label htmlFor="email" className="text-sm font-medium">
//               Email
//             </label>
//             <Input
//               id="email"
//               defaultValue={user?.email}
//               className="dark:border-zinc-700"
//             />
//           </div>
//           <div className="grid gap-2">
//             <label htmlFor="password" className="text-sm font-medium">
//               Password (leave empty to keep current)
//             </label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="Enter new password"
//               className="dark:border-zinc-700"
//             />
//           </div>
//         </div>
//         <DialogFooter className="sm:justify-start">
//           <Button
//             type="submit"
//             onClick={handleSave}
//             className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
//           >
//             Save changes
//           </Button>
//           <DialogClose asChild>
//             <Button variant="outline" className="dark:border-zinc-700">
//               Cancel
//             </Button>
//           </DialogClose>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export function DeleteModal({ user, onClose, onDelete }: DeleteModalProps) {
//   return (
//     <AlertDialog open={!!user} onOpenChange={onClose}>
//       <AlertDialogContent className="dark:border-zinc-700">
//         <AlertDialogHeader>
//           <AlertDialogTitle className="text-2xl font-bold">
//             Delete User
//           </AlertDialogTitle>
//           <AlertDialogDescription>
//             Are you sure you want to delete this user ?
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel className="dark:border-zinc-700">
//             Cancel
//           </AlertDialogCancel>
//           <AlertDialogAction
//             onClick={() => user && onDelete(user)}
//             className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
//           >
//             Delete
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }

// export function CreateModal({ isOpen, onClose, onCreate }: CreateModalProps) {
//   const handleCreate = () => {
//     const nameInput = document.getElementById('create-name') as HTMLInputElement;
//     const roleInput = document.getElementById('create-role') as HTMLInputElement;
//     const emailInput = document.getElementById('create-email') as HTMLInputElement;
//     const passwordInput = document.getElementById('create-password') as HTMLInputElement;
    
//     const newUser = {
//       name: nameInput.value,
//       role: roleInput.value,
//       email: emailInput.value,
//       password: passwordInput.value,
//     };
    
//     onCreate(newUser);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold">Create New User</DialogTitle>
//         </DialogHeader>
//         <div className="grid gap-2">
//           <div className="grid gap-2">
//             <label htmlFor="create-name" className="text-sm font-medium">
//               Name
//             </label>
//             <Input
//               id="create-name"
//               className="dark:border-zinc-700"
//               placeholder="Enter name"
//             />
//           </div>
//           <div className="grid gap-2">
//             <label htmlFor="create-role" className="text-sm font-medium">
//               Role
//             </label>
//             <Input
//               id="create-role"
//               className="dark:border-zinc-700"
//               placeholder="Enter role"
//             />
//           </div>
//           <div className="grid gap-2">
//             <label htmlFor="create-email" className="text-sm font-medium">
//               Email
//             </label>
//             <Input
//               id="create-email"
//               className="dark:border-zinc-700"
//               placeholder="Enter email"
//               type="email"
//             />
//           </div>
//           <div className="grid gap-2">
//             <label htmlFor="create-password" className="text-sm font-medium">
//               Password
//             </label>
//             <Input
//               id="create-password"
//               type="password"
//               className="dark:border-zinc-700"
//               placeholder="Enter password"
//             />
//           </div>
//         </div>
//         <DialogFooter className="sm:justify-start">
//           <Button
//             type="submit"
//             onClick={handleCreate}
//             className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
//           >
//             Create User
//           </Button>
//           <DialogClose asChild>
//             <Button variant="outline" className="dark:border-zinc-700">
//               Cancel
//             </Button>
//           </DialogClose>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [userid, setUserid] = useState('');
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch users from the API
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setIsLoading(true);
          console.log('Starting to fetch users...');
          const authToken = localStorage.getItem('auth_token');
          
          if (!authToken) {
            console.error('No auth token found in localStorage');
            toast({
              title: "Error",
              description: "Authentication token not found. Please log in again.",
              variant: "destructive"
            });
            return;
          }

          console.log('Making request to /api/users/list');
          const response = await fetch(`/api/users/list`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Response status:', response.status);
          const result = await response.json();
          console.log('Users API response:', result);
  
          if (result.success && Array.isArray(result.data)) {
            console.log(`Found ${result.data.length} users:`, result.data);
            // Map the users to ensure they have the correct structure
            const mappedUsers = result.data.map((user: any) => ({
              id: user.id || user.userid,
              name: user.name || user.username || 'Unknown',
              email: user.email || 'No email',
              role: user.role || 'user'
            }));
            setUsers(mappedUsers);
          } else {
            console.error('Failed to fetch users:', result.message);
            toast({
              title: "Error",
              description: result.message || "Failed to load users. Please try again.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Failed to fetch users:', error);
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchUsers();
    }
  }, [isOpen, toast]);
  
  const handleSearch = () => {
    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      toast({
        title: "Invalid date range",
        description: "Start date must be before end date",
        variant: "destructive"
      });
      return;
    }
    
    // Build search parameters
    const params: Record<string, string> = {};
    
    if (userid) params.userid = userid;
    if (src) params.src = src;
    if (dst) params.dst = dst;
    if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
    if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');
    
    onSearch(params);
    onClose();
  };
  
  const resetFilters = () => {
    setUserid('');
    setSrc('');
    setDst('');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Search Call Records</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="userid" className="text-sm font-medium">
              User
            </label>
            <select
              id="userid"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              disabled={isLoading}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {isLoading && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading users...
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="src" className="text-sm font-medium">
                Source Number
              </label>
              <Input
                id="src"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                placeholder="e.g. 101"
                className="dark:border-zinc-700"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="dst" className="text-sm font-medium">
                Destination Number
              </label>
              <Input
                id="dst"
                value={dst}
                onChange={(e) => setDst(e.target.value)}
                placeholder="e.g. 12345"
                className="dark:border-zinc-700"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${
                      !startDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${
                      !endDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            onClick={resetFilters}
            variant="outline"
            className="dark:border-zinc-700"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSearch}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Search
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

