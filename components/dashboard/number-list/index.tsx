/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/payment-list/cards/Statistics';
import NumberListTable from '@/components/dashboard/number-list/cards/NumberListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HiOutlineDocumentText,
  HiPlayCircle,
  HiPauseCircle,
  HiClock
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

export default function PaymentList(props: Props) {
  const router = useRouter();

  const [numberStats, setNumberStats] = useState({
    totalNumbers: 0,
    activeNumbers: 0,
    inactiveNumbers: 0,
    todayNumbers: 0
  });

  const fetchNumberData = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/numbers`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Calculate statistics
        const Numbers = result.data;
        const stats = {
          totalNumbers: Numbers?.length,
          activeNumbers: Numbers?.filter(Number => Number?.enabled === 1)?.length,
          inactiveNumbers: Numbers?.filter(Number => Number?.enabled === 0)?.length,
          todayNumbers: Numbers?.filter(Number => new Date(Number?.createdAt).toDateString() === new Date().toDateString())?.length
        };
        setNumberStats(stats);
        console.log('User statistics:', stats);
      }
    } catch (error) {
      console.error('Failed to fetch user data for statistics:', error);
    }
  };

  useEffect(() => {

    fetchNumberData();
  }, []);

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Payments Management"
      description="Manage your system payments"
    >
      <div className="mt-3 h-full w-full">
        <div className="mb-5 grid w-full grid-cols-1 gap-5 rounded-md md:grid-cols-2 xl:grid-cols-4">
          {/* statistics */}
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiOutlineDocumentText size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Numbers"
            value={numberStats?.totalNumbers}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiPlayCircle size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Active Numbers"
            value={numberStats?.activeNumbers}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiPauseCircle size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="InActive Numbers"
            value={numberStats?.inactiveNumbers}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiClock size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Created Today"
            value={numberStats?.todayNumbers}
          />
        </div>
        {/* Conversion and tables*/}
        <div className="h-full w-full rounded-md">
          <NumberListTable freshData={fetchNumberData} />
        </div>
      </div>
    </DashboardLayout>
  );
} 