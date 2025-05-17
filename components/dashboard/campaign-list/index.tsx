/*eslint-disable*/
'use client';

import Statistics from '@/components/dashboard/campaign-list/cards/Statistics';
import CampaignListTable from '@/components/dashboard/campaign-list/cards/CampaignListTable';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HiMegaphone,
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

export default function CampaignList(props: Props) {
  const router = useRouter();

  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    inactiveCampaigns: 0,
    todayCampaigns: 0
  });

  const fetchCampaignData = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/campaigns`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Calculate statistics
        const campaigns = result.data;
        const stats = {
          totalCampaigns: campaigns?.length,
          activeCampaigns: campaigns?.filter(campaign => campaign?.status === 1)?.length,
          inactiveCampaigns: campaigns?.filter(campaign => campaign?.status === 0)?.length,
          todayCampaigns: campaigns?.filter(campaign => new Date(campaign?.createdAt).toDateString() === new Date().toDateString())?.length
        };
        setCampaignStats(stats);
        console.log('User statistics:', stats);
      }
    } catch (error) {
      console.error('Failed to fetch user data for statistics:', error);
    }
  };

  useEffect(() => {

    fetchCampaignData();
  }, []);

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Campaigns Management"
      description="Manage your marketing campaigns"
    >
      <div className="mt-3 h-full w-full">
        <div className="mb-5 grid w-full grid-cols-1 gap-5 rounded-md md:grid-cols-2 xl:grid-cols-4">
          {/* statistics */}
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiMegaphone size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Total Campaigns"
            value={campaignStats.totalCampaigns}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiCheckCircle size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Active Campaigns"
            value={campaignStats.activeCampaigns}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiMinusCircle size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="InActive Campaigns"
            value={campaignStats.inactiveCampaigns}
          />
          <Statistics
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 dark:text-white">
                <HiClock size={20} className="text-zinc-600 dark:text-white" />
              </div>
            }
            title="Created Today"
            value={campaignStats.todayCampaigns}
          />
        </div>
        {/* Campaign list table */}
        <div className="h-full w-full rounded-md">
          <CampaignListTable refreshData={fetchCampaignData} />
        </div>
      </div>
    </DashboardLayout>
  );
} 