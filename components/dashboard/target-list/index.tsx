/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/cdr-list/cards/Statistics';
import TargetListTable from '@/components/dashboard/target-list/cards/TargetListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HiClock,
  HiUserMinus,
  HiUserPlus,
  HiOutlineArrowPathRoundedSquare
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

export default function Settings(props: Props) {
  const router = useRouter();

  const [targetStats, setTargetStats] = useState({
    totalTargets: 0,
    activeTargets: 0,
    inactiveTargets: 0,
    todayTargets: 0
  });

  const fetchTargetData = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/targets`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Calculate statistics
        const Targets = result.data;
        const stats = {
          totalTargets: Targets?.length,
          activeTargets: Targets?.length,
          inactiveTargets: Targets?.length,
          todayTargets: Targets?.filter(Target => new Date(Target?.createdAt).toDateString() === new Date().toDateString())?.length
        };
        setTargetStats(stats);
        console.log('User statistics:', stats);
      }
    } catch (error) {
      console.error('Failed to fetch user data for statistics:', error);
    }
  };

  useEffect(() => {

    fetchTargetData();
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
                <HiOutlineArrowPathRoundedSquare size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Targets"
            value={targetStats?.totalTargets}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiUserPlus size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Users Today"
            value="-"
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiUserMinus size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Users Requests"
            value="-"
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiClock size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Created Today"
            value={targetStats?.todayTargets}
          />
        </div>
        {/* Conversion and tables*/}
        <div className="h-full w-full rounded-md">
          <TargetListTable refreshData={fetchTargetData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
