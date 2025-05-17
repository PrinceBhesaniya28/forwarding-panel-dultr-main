/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/cdr-list/cards/Statistics';
import LiveListTable from '@/components/dashboard/live-list/cards/LiveListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import {
  HiLockClosed,
  HiOutlineWallet,
  HiUserPlus,
  HiOutlinePhoneArrowDownLeft
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
                <HiOutlinePhoneArrowDownLeft size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Calls"
            value="-"
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
                <HiOutlineWallet size={20} className="text-zinc-600 dark:text-white stroke-2" />
              </div>
            }
            title="REST Requests"
            value="-"
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiLockClosed size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Auth Requests"
            value="-"
          />
        </div>
        {/* Conversion and tables*/}
        <div className="h-full w-full rounded-md">
          <LiveListTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
