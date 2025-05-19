/*eslint-disable*/
'use client';

import { useEffect, useState, useCallback } from 'react';
import MainDashboardTable from '@/components/dashboard/main/cards/MainDashboardTable';
import Statistics from '@/components/dashboard/main/cards/Statistics';
import AreaChartComponent from '@/components/charts/AreaChart';
import BarChartComponent from '@/components/charts/BarChart';
import DashboardLayout from '@/components/layout';
import { Database } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import {
  HiChartBar,
  HiUsers,
  HiOutlineWallet,
  HiOutlineCurrencyDollar
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
  const [totalUsers, setTotalUsers] = useState<string>("Loading...");
  const [totalCreditsUsed, setTotalCreditsUsed] = useState<string>("Loading...");
  const [totalCalls, setTotalCalls] = useState<string>("Loading...");
  const [liveCalls, setLiveCalls] = useState<string>("Loading...");
  const [lifetimeCalls, setLifetimeCalls] = useState<string>("Loading...");
  const [lifetimeCredits, setLifetimeCredits] = useState<string>("Loading...");
  const [refreshInterval, setRefreshInterval] = useState<number>(5000); // 5 seconds default

  // Get today's date range
  const getTodayDateRange = () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    return {
      startDate: startOfDay.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  // Fetch live calls
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
  
  // Fetch today's calls count
  const fetchCallsCount = useCallback(async () => {
    try {
      const { startDate, endDate } = getTodayDateRange();
      const query = new URLSearchParams();
      query.append('startDate', startDate);
      query.append('endDate', endDate);
      
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
  }, []);
  
  // Fetch lifetime calls count
  const fetchLifetimeCallsCount = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      const startDate = new Date(2000, 0, 1).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      query.append('startDate', startDate);
      query.append('endDate', endDate);
      
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
          setLifetimeCalls(data.data.length.toString());
        } else {
          setLifetimeCalls("0");
        }
      } else {
        setLifetimeCalls("Error");
      }
    } catch (error) {
      console.error("Failed to fetch lifetime calls count:", error);
      setLifetimeCalls("Error");
    }
  }, []);
  
  // Fetch today's credits used
  const fetchCreditsUsed = useCallback(async () => {
    try {
      const { startDate, endDate } = getTodayDateRange();
      const query = new URLSearchParams();
      query.append('startDate', startDate);
      query.append('endDate', endDate);
      
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
  }, []);

  // Fetch lifetime credits used
  const fetchLifetimeCreditsUsed = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      const startDate = new Date(2000, 0, 1).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      query.append('startDate', startDate);
      query.append('endDate', endDate);
      
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
          setLifetimeCredits(data.data[0]['sum(`amount`)']?.toFixed(3)?.toString());
        } else {
          setLifetimeCredits("0");
        }
      } else {
        setLifetimeCredits("Error");
      }
    } catch (error) {
      console.error("Failed to fetch lifetime credits used:", error);
      setLifetimeCredits("Error");
    }
  }, []);

  useEffect(() => {
    // Fetch total users from API
    const fetchUserCount = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        
        const response = await fetch(`/api/dashboard/users`, {
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
    fetchLifetimeCreditsUsed();
    fetchCallsCount();  
    fetchLifetimeCallsCount();
    fetchLiveCalls();   
  }, [fetchLiveCalls, fetchCreditsUsed, fetchLifetimeCreditsUsed, fetchCallsCount, fetchLifetimeCallsCount]);

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
      fetchLifetimeCallsCount();
    }, refreshInterval);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchCallsCount, fetchLifetimeCallsCount, refreshInterval]);

  // Set up interval for updating credits used
  useEffect(() => {
    // Initial fetch done in the first useEffect
    
    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      fetchCreditsUsed();
      fetchLifetimeCreditsUsed();
    }, refreshInterval);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchCreditsUsed, fetchLifetimeCreditsUsed, refreshInterval]);

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Dashboard"
      description="Monitor your system activity"
    >
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-full">
          <Statistics
            title="Today Calls"
            value={totalCalls}
            info={`Calls made till now: ${lifetimeCalls}`}
            icon={<HiChartBar className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
        <div className="h-full">
          <Statistics
            title="Live Calls"
            value={liveCalls}
            info="Currently Active"
            icon={<HiUsers className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
        <div className="h-full">
          <Statistics
            title="Total Users"
            value={totalUsers}
            info="Total registered users"
            icon={<HiUsers className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
        <div className="h-full">
          <Statistics
            title="Today Credit Spent"
            value={totalCreditsUsed}
            info={`Credits used till now: ${lifetimeCredits}`}
            icon={<HiOutlineCurrencyDollar className="h-8 w-8 text-zinc-700 dark:text-white" />}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-6 flex-col xl:flex-row">
        <AreaChartComponent />
        <BarChartComponent />
      </div>
      {/* Conversion and tables*/}
      <div className="mt-6 h-full w-full rounded-md">
        <MainDashboardTable />
      </div>
    </DashboardLayout>
  );
}
