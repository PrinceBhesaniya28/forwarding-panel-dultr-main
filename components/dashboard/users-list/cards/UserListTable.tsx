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

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  trunk?: string;
  status: boolean;
  balance: number;
};

function UserListTable(props: { refreshData: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 6;

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {

        const authToken = localStorage.getItem('auth_token');
        
        const response = await fetch(`/api/users/`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
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
            title: 'Error fetching users',
            description: 'Failed to load user data. Please try again later.'
          });
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
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

  const handleSaveEdit = async (user: User) => {
    try {
      console.log('Updating user:', user);
      const response = await fetch('https://dialo.dollu.com/rest/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          trunk: user.trunk,
          status: user.status
        })
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Server error:', result);
        toast({
          variant: 'destructive',
          title: 'Failed to update user',
          description:
            result.message || 'An error occurred while updating the user.'
        });
        throw new Error('Failed to update user');
      }

      setData(
        data.map((item) =>
          item.id === user.id ? { ...item, ...result.data } : item
        )
      );
      setEditingUser(null);
      props.refreshData();
      toast({
        title: 'User updated',
        description: 'User information has been successfully updated.'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user. Please try again.'
      });
    }
  };

  const handleConfirmDelete = async (user: User) => {
    try {
      const response = await fetch(
        `https://dialo.dollu.com/rest/users/${user.id}`,
        {
          method: 'DELETE'
        }
      );

      const result = await response.json();
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Failed to delete user',
          description:
            result.message || 'An error occurred while deleting the user.'
        });
        throw new Error('Failed to delete user');
      }

      setData(data.filter((item) => item.id !== user.id));
      setDeletingUser(null);
      props.refreshData();
      toast({
        title: 'User deleted',
        description: 'User has been successfully removed.'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user. Please try again.'
      });
    }
  };

  const handleCreate = async (newUser: Omit<User, 'id'>) => {
    try {
      const response = await fetch('https://dialo.dollu.com/rest/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          trunk: newUser.trunk,
          status: newUser.status
        })
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Server error:', result);
        toast({
          variant: 'destructive',
          title: 'Failed to create user',
          description:
            result.message || 'An error occurred while creating the user.'
        });
        throw new Error('Failed to create user');
      }

      setData([...data, result.data]);
      props.refreshData();
      setIsCreateModalOpen(false);
      toast({
        title: 'User created',
        description: 'New user has been successfully created.'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create user. Please try again.'
      });
    }
  };

  // Filter data based on search query
  const filteredData = data.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.trunk &&
        user.trunk.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate pagination based on filtered data
  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const startIndex = currentPage * usersPerPage;
  const displayedUsers = filteredData.slice(
    startIndex,
    startIndex + usersPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  return (
    <>
      <div className="flex justify-between items-center pb-4 pt-4 gap-4">
        <div className="relative w-80">
          <Input
            type="text"
            placeholder="Search users..."
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
          Add User
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
                    Email
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Role
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Trunk
                  </p>
                </TableHead>
                <TableHead className="cursor-pointer border-zinc-200 pl-5 pr-4 pt-2 text-start dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Balance
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
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      No users found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                displayedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex max-w-max items-center">
                        <Checkbox className="me-2.5" />
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {user.name || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {user.email || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {user.role || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {user.trunk || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {user.balance || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {user.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => setEditingUser(user)}
                        >
                          <HiPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                          onClick={() => setDeletingUser(user)}
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
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEdit}
      />

      <DeleteModal
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
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

export default UserListTable;
