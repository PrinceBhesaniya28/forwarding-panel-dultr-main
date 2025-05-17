/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/trunk-list/cards/Statistics';
import TrunkListTable from '@/components/dashboard/trunk-list/cards/TrunkListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HiOutlineChartBarSquare,
  HiMinusCircle,
  HiClock,
  HiCheckCircle
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

export default function TrunkList(props: Props) {
  const router = useRouter();

  const [trunkStats, setTrunkStats] = useState({
    totalTrunks: 0,
    activeTrunks: 0,
    inactiveTrunks: 0,
    todayTrunks: 0
  });

  const fetchTrunkData = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`https://dialo.dollu.com/rest/trunks/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Calculate statistics
        const Trunks = result.data;
        const stats = {
          totalTrunks: Trunks?.length,
          activeTrunks: Trunks?.filter(Trunk => Trunk?.status === 1)?.length,
          inactiveTrunks: Trunks?.filter(Trunk => Trunk?.status === 0)?.length,
          todayTrunks: Trunks?.filter(Trunk => new Date(Trunk?.createdAt).toDateString() === new Date().toDateString())?.length
        };
        setTrunkStats(stats);
        console.log('User statistics:', stats);
      }
    } catch (error) {
      console.error('Failed to fetch user data for statistics:', error);
    }
  };

  useEffect(() => {

    fetchTrunkData();
  }, []);

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Trunk Management"
      description="Manage your trunk configurations"
    >
      <div className="mt-3 h-full w-full">
        <div className="mb-5 grid w-full grid-cols-1 gap-5 rounded-md md:grid-cols-2 xl:grid-cols-4">
          {/* statistics */}
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiOutlineChartBarSquare size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Trunks"
            value={trunkStats.totalTrunks}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiCheckCircle size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Active Trunks"
            value={trunkStats.activeTrunks}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiMinusCircle size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="InActive Trunks"
            value={trunkStats.inactiveTrunks}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiClock size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Created Today"
            value={trunkStats.todayTrunks}
          />
        </div>
        {/* Trunk list table */}
        <div className="h-full w-full rounded-md">
          <TrunkListTable refreshData={fetchTrunkData} />
        </div>
      </div>
    </DashboardLayout>
  );
} 