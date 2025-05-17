/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/users-list/cards/Statistics';
import UserListTable from '@/components/dashboard/users-list/cards/UserListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HiUserCircle,
  HiUserMinus,
  HiUserPlus,
  HiUsers
} from 'react-icons/hi2';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null | any;
  userDetails: { [x: string]: any } | null | any;
}

type UserStats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalAdmins: number;
}

export default function Settings(props: Props) {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalAdmins: 0
  });

  const fetchUserData = async () => {
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
        // Calculate statistics
        const users = result.data;
        const stats = {
          totalUsers: users?.filter(user => user?.role === 'user').length,
          activeUsers: users?.filter(user => user?.status === 1).length,
          inactiveUsers: users?.filter(user => user?.status === 0).length,
          totalAdmins: users?.filter(user => user?.role === 'admin').length
        };
        setUserStats(stats);
        console.log('User statistics:', stats);
      }
    } catch (error) {
      console.error('Failed to fetch user data for statistics:', error);
    }
  };

  useEffect(() => {

    fetchUserData();
  }, []);

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Users Management"
      description="Manage your system users"
    >
      <div className="mt-3 h-full w-full">
        <div className="mb-5 grid w-full grid-cols-1 gap-5 rounded-md md:grid-cols-2 xl:grid-cols-4">
          {/* statistics */}
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiUsers size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Users"
            value={userStats?.totalUsers?.toString()}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiUserPlus size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Active Users"
            value={userStats?.activeUsers?.toString()}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiUserMinus size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Inactive Users"
            value={userStats?.inactiveUsers?.toString()}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiUserCircle size={24} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Admin"
            value={userStats?.totalAdmins?.toString()}
          />
        </div>
        {/* Conversion and tables*/}
        <div className="h-full w-full rounded-md">
          <UserListTable refreshData={fetchUserData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
