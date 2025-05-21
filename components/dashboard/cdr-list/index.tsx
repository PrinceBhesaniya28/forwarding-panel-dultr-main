/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/cdr-list/cards/Statistics';
import CdrListTable from '@/components/dashboard/cdr-list/cards/CdrListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HiClock,
  HiPhoneXMark,
  HiPhoneArrowUpRight,
  HiOutlineCpuChip,
  HiChartBar
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

export default function CdrList(props: Props) {
  const router = useRouter();

  const [cdrStats, setCdrStats] = useState({
    totalCdrs: 0,
    answeredCdrs: 0,
    unansweredCdrs: 0,
    todayCdrs: 0
  });

  const fetchCdrData = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/cdr`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Calculate statistics
        const Cdrs = result.data;
        const stats = {
          totalCdrs: Cdrs?.length,
          answeredCdrs: Cdrs?.filter(Cdr => Cdr?.disposition === 'ANSWERED')?.length,
          unansweredCdrs: Cdrs?.filter(Cdr => 
            Cdr?.disposition === 'FAILED' || 
            Cdr?.disposition === 'CONCURRENCY FULL' || 
            Cdr?.disposition === 'NO ANSWER' || 
            Cdr?.disposition === 'BUSY' ||
            Cdr?.disposition === 'IN_QUEUE_CC_FULL' ||
            Cdr?.disposition === 'ROUTE UNAVAILABLE'
          )?.length,
          todayCdrs: Cdrs?.filter(Cdr => {
            // Today is calculated from 4:30 PM yesterday to 4:30 PM today
            const callDate = new Date(Cdr?.calldate);
            const now = new Date();
            
            // Create yesterday's 4:30 PM
            const yesterdayBound = new Date();
            yesterdayBound.setDate(now.getDate() - 1);
            yesterdayBound.setHours(16, 30, 0, 0); // 4:30 PM

            // Create today's 4:30 PM
            const todayBound = new Date();
            todayBound.setHours(16, 30, 0, 0); // 4:30 PM
            
            return callDate >= yesterdayBound && callDate <= todayBound;
          })?.length
        };
        setCdrStats(stats);
        console.log('User statistics:', stats);
      }
    } catch (error) {
      console.error('Failed to fetch user data for statistics:', error);
    }
  };

  useEffect(() => {

    fetchCdrData();
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
                <HiOutlineCpuChip size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Records"
            value={cdrStats?.totalCdrs}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiPhoneArrowUpRight size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Answered Calls"
            value={cdrStats?.answeredCdrs}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiPhoneXMark size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="UnAnswered Calls"
            value={cdrStats?.unansweredCdrs}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiClock size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Call's Today"
            value={cdrStats?.todayCdrs}
            info=""
          />
        </div>
        {/* Conversion and tables*/}
        <div className="h-full w-full rounded-md">
          <CdrListTable refreshData={fetchCdrData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
