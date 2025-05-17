/*eslint-disable*/
'use client';

import { useEffect, useState, useCallback } from 'react';
import MainDashboardTable from '@/components/dashboard/main/cards/MainDashboardTable';
import Statistics from '@/components/dashboard/main/cards/Statistics';
import AreaChartComponent from '@/components/charts/AreaChart';
import BarChartComponent from '@/components/charts/BarChart';
import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/types_db';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import {
  HiChartBar,
  HiUsers,
  HiOutlineWallet,
  HiOutlineCurrencyDollar
} from 'react-icons/hi2';
import Link from 'next/link';

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

type TimeFilter = '1day' | '7days' | '1month' | 'lifetime';

export default function Settings(props: Props) {
  const [totalUsers, setTotalUsers] = useState<string>("Loading...");
  const [totalCreditsUsed, setTotalCreditsUsed] = useState<string>("Loading...");
  const [totalCalls, setTotalCalls] = useState<string>("Loading...");
  const [liveCalls, setLiveCalls] = useState<string>("Loading...");
  const [refreshInterval, setRefreshInterval] = useState<number>(5000); // 5 seconds default
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1day'); // Default to 1 day
  
  // Helper function to get dates based on the selected time filter
  const getDatesForFilter = (filter: TimeFilter) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    
    switch (filter) {
      case '1day':
        startDate.setDate(endDate.getDate() - 1); // 24 hours ago
        break;
      case '7days':
        startDate.setDate(endDate.getDate() - 7); // 7 days ago
        break;
      case '1month':
        startDate.setMonth(endDate.getMonth() - 1); // 1 month ago
        break;
      case 'lifetime':
        startDate.setFullYear(2000); // Far back in the past
        break;
      default:
        startDate.setDate(endDate.getDate() - 1); // Default to 24 hours
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch live calls - create a separate function that can be called repeatedly
  const fetchLiveCalls = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
        
      const response = await fetch(`/api/calls/live`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          let callLength = 0;
          for (let key in data.data) {
            callLength += data.data[key].length;
          }
          setLiveCalls(callLength.toString());
        } else {
          setLiveCalls("0");
        }
      } else {
        setLiveCalls("Error");
      }
    } catch (error) {
      console.error("Failed to fetch live calls:", error);
      setLiveCalls("Error");
    }
  }, []);
  
  // Fetch total calls count - create a separate function that can be called repeatedly
  const fetchCallsCount = useCallback(async () => {
    try {
      // Only add date filters if we're not showing lifetime data
      const query = new URLSearchParams();
      if (timeFilter !== 'lifetime') {
        const { startDate, endDate } = getDatesForFilter(timeFilter);
        query.append('startDate', startDate);
        query.append('endDate', endDate);
      }
      
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/cdr?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          setTotalCalls(data.data.length.toString());
        } else {
          setTotalCalls("0");
        }
      } else {
        setTotalCalls("Error");
      }
    } catch (error) {
      console.error("Failed to fetch calls count:", error);
      setTotalCalls("Error");
    }
  }, [timeFilter]);
  
  // Fetch total credits used - create a separate function that can be called repeatedly
  const fetchCreditsUsed = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (timeFilter !== 'lifetime') {
        const { startDate, endDate } = getDatesForFilter(timeFilter);
        query.append('startDate', startDate);
        query.append('endDate', endDate);
      }
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/dashboard/credits-used?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data[0] && data.data[0]['sum(`amount`)']) {
          setTotalCreditsUsed(data.data[0]['sum(`amount`)']?.toFixed(3)?.toString());
        } else {
          setTotalCreditsUsed("0");
        }
      } else {
        setTotalCreditsUsed("Error");
      }
    } catch (error) {
      console.error("Failed to fetch credits used:", error);
      setTotalCreditsUsed("Error");
    }
  }, [timeFilter]);

  useEffect(() => {
    // Fetch total users from API
    const fetchUserCount = async () => {
      try {
        const query = new URLSearchParams();
        if (timeFilter !== 'lifetime') {
          const { startDate, endDate } = getDatesForFilter(timeFilter);
          query.append('startDate', startDate);
          query.append('endDate', endDate);
        }

        const authToken = localStorage.getItem('auth_token');
        
        const response = await fetch(`/api/dashboard/users?${query.toString()}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data['count(*)']) {
            setTotalUsers(data.data['count(*)'].toString());
          } else {
            setTotalUsers("0");
          }
        } else {
          setTotalUsers("Error");
        }
      } catch (error) {
        console.error("Failed to fetch user count:", error);
        setTotalUsers("Error");
      }
    };

    fetchUserCount();
    fetchCreditsUsed(); 
    fetchCallsCount();  
    fetchLiveCalls();   
  }, [fetchLiveCalls, fetchCreditsUsed, fetchCallsCount, timeFilter]);

  // Set up interval for updating live calls
  useEffect(() => {
    // Fetch live calls immediately on mount
    fetchLiveCalls();
    
    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      fetchLiveCalls();
    }, refreshInterval);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchLiveCalls, refreshInterval]);

  // Set up interval for updating total calls count
  useEffect(() => {
    // Initial fetch done in the first useEffect
    
    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      fetchCallsCount();
    }, refreshInterval);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchCallsCount, refreshInterval]);

  // Set up interval for updating credits used
  useEffect(() => {
    // Initial fetch done in the first useEffect
    
    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      fetchCreditsUsed();
    }, refreshInterval);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchCreditsUsed, refreshInterval]);

  // Get time filter label
  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case '1day': return 'Last 24 Hours';
      case '7days': return 'Last 7 Days';
      case '1month': return 'Last Month';
      case 'lifetime': return 'All Time';
      default: return 'Last 24 Hours';
    }
  };

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Dashboard"
      description="Monitor your system activity"
    >
      <div className="mt-3 flex justify-end mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={timeFilter === '1day' ? "default" : "outline"} 
            onClick={() => setTimeFilter('1day')}
            size="sm"
          >
            1 Day
          </Button>
          <Button 
            variant={timeFilter === '7days' ? "default" : "outline"} 
            onClick={() => setTimeFilter('7days')}
            size="sm"
          >
            7 Days
          </Button>
          <Button 
            variant={timeFilter === '1month' ? "default" : "outline"} 
            onClick={() => setTimeFilter('1month')}
            size="sm"
          >
            1 Month
          </Button>
          <Button 
            variant={timeFilter === 'lifetime' ? "default" : "outline"} 
            onClick={() => setTimeFilter('lifetime')}
            size="sm"
          >
            Lifetime
          </Button>
        </div>
      </div>
      
      <div className="grid h-full w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <Statistics
            title="Total Calls"
            description={getTimeFilterLabel()}
            value={totalCalls}
            icon={<HiChartBar className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
        <div>
          <Statistics
            title="Live Calls"
            description="Currently Active"
            value={liveCalls}
            icon={<HiUsers className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
        <div>
          <Statistics
            title="Total Users"
            description={getTimeFilterLabel()}
            value={totalUsers}
            icon={<HiUsers className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
        <div>
          <Statistics
            title="Credits Used"
            description={getTimeFilterLabel()}
            value={totalCreditsUsed}
            icon={<HiOutlineCurrencyDollar className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
      </div>
      
      <div className="mb-5 flex gap-5 flex-col xl:flex-row">
        <AreaChartComponent />
        <BarChartComponent />
      </div>
      {/* Conversion and talbes*/}
      <div className="h-full w-full rounded-md ">
        <MainDashboardTable />
      </div>
    </DashboardLayout>
  );
}
