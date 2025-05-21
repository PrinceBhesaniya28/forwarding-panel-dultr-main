/*eslint-disable*/
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout';
import AdvancedReportingTable from './cards/AdvancedReportingTable';
import { Database } from '@/types/types_db';
import { User as SupabaseUser } from '@supabase/supabase-js';

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

interface ExtendedUser extends SupabaseUser {
  balance?: number;
  callRate?: number;
}

interface Props {
  user: ExtendedUser | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null | any;
  userDetails: { [x: string]: any } | null | any;
}

export default function AdvancedReporting(props: Props) {
  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Advanced Reporting"
      description="Detailed call analytics and reporting"
    >
      <div className="mt-6 h-full w-full rounded-md">
        <AdvancedReportingTable />
      </div>
    </DashboardLayout>
  );
} 