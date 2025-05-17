'use client';

import { TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Define the type for the API response
interface CreditUsageDataItem {
  month?: string; // Old format
  date?: string;  // New format
  totalAmount: string;
  totalTransactions?: string;
  averageAmount?: string;
  minAmount?: string;
  maxAmount?: string;
}

// Transform API data to chart format
interface ChartDataItem {
  date: string;
  desktop: number;
}

const chartConfig = {
  desktop: {
    label: 'Credits',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

// Format date for display based on time range
const formatDate = (dateStr: string, timeRange: string) => {
  if (!dateStr) return '';
  
  // For dates in YYYY-MM format (monthly data)
  if (dateStr.length === 7 && dateStr.includes('-')) {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
  
  // For dates in YYYY-MM-DD format (daily data)
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const date = new Date(dateStr);
    
    // For 7d or 30d view, show abbreviated date
    if (timeRange === '7d' || timeRange === '30d') {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
    }
    
    // For 1d view with day format, show date and time
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  }
  
  // For dates in YYYY-MM-DD HH:MM:SS format (hourly data)
  if (dateStr.includes(' ') && dateStr.length > 10) {
    const date = new Date(dateStr);
    
    // For 1-day view, show hours
    if (timeRange === '1d') {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // For other views with datetime, show date only
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  return dateStr;
};

export default function BarChartComponent() {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [totalCredits, setTotalCredits] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to calculate date ranges based on selected time period
  const getDateRange = (period: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === '1d') {
      startDate.setDate(endDate.getDate() - 1);
    } else if (period === '7d') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(endDate.getDate() - 30);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch data from API with date range
  const fetchData = useCallback(async (period: string) => {
    setIsLoading(true);
    
    try {
      const { startDate, endDate } = getDateRange(period);
      
      const query = new URLSearchParams();
      query.append('startDate', startDate);
      query.append('endDate', endDate);
      query.append('period', period); // Add period for API to know what format to return
      query.append('_', Date.now().toString()); // Cache buster
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/dashboard/credits-usage-graph?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Log the raw API response
      console.log('BarChart API response:', result);
      
      if (result.success && result.data) {
        // Ensure we're working with an array, even if API returns a single object
        const dataArray = Array.isArray(result.data) ? result.data : [result.data];
        console.log('Data array:', dataArray);
        
        // Transform data for the chart
        let formattedData = dataArray.map((item: CreditUsageDataItem) => ({
          date: item.date || item.month || '', // Use date field if available, otherwise fall back to month
          desktop: parseFloat(item.totalAmount) || 0
        }));
        
        // If it's 1-day view and we have limited data points, make sure we show hours properly
        if (period === '1d' && formattedData.length < 24) {
          // We'll keep the existing data and not try to fill in more points
          console.log('Using hourly data for 1-day view:', formattedData);
        }
        // If it's 7-day view and we have limited data, ensure we have a point per day
        else if (period === '7d' && formattedData.length < 7) {
          // Special handling if needed for 7-day view
          console.log('Using daily data for 7-day view:', formattedData);
        } 
        // For 30-day view, just use the data as is
        else if (period === '30d') {
          console.log('Using monthly data for 30-day view:', formattedData);
        }
        
        // Sort data chronologically
        formattedData.sort((a, b) => a.date.localeCompare(b.date));
        
        // If we have no data or only one point, create a zero point to show the chart properly
        if (formattedData.length === 0) {
          formattedData = [{ date: '', desktop: 0 }];
        } else if (formattedData.length === 1) {
          const singlePoint = formattedData[0];
          formattedData = [
            { date: '', desktop: 0 },
            singlePoint
          ];
        }
        
        console.log('Final formatted data:', formattedData);
        
        setChartData(formattedData);
        
        // Calculate total credits
        const total = dataArray.reduce((sum: number, item: CreditUsageDataItem) => 
          sum + (parseFloat(item.totalAmount) || 0), 0);
        setTotalCredits(total.toFixed(4)); // Format to 4 decimal places
      } else {
        // If no data or error, set empty chart data
        setChartData([]);
        setTotalCredits("0");
      }
    } catch (error) {
      console.error("Error fetching credits usage data:", error);
      setChartData([]);
      setTotalCredits("0");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data silently without showing loading state
  const refreshData = useCallback(async (period: string) => {
    try {
      const { startDate, endDate } = getDateRange(period);
      
      const query = new URLSearchParams();
      query.append('startDate', startDate);
      query.append('endDate', endDate);
      query.append('period', period); // Add period for API to know what format to return
      query.append('_', Date.now().toString()); // Cache buster
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/dashboard/credits-usage-graph?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Ensure we're working with an array, even if API returns a single object
        const dataArray = Array.isArray(result.data) ? result.data : [result.data];
        
        // Transform data for the chart
        let formattedData = dataArray.map((item: CreditUsageDataItem) => ({
          date: item.date || item.month || '', // Use date field if available, otherwise fall back to month
          desktop: parseFloat(item.totalAmount) || 0
        }));
        
        // If it's 1-day view and we have limited data points, make sure we show hours properly
        if (period === '1d' && formattedData.length < 24) {
          // We'll keep the existing data and not try to fill in more points
          console.log('Using hourly data for 1-day view:', formattedData);
        }
        // If it's 7-day view and we have limited data, ensure we have a point per day
        else if (period === '7d' && formattedData.length < 7) {
          // Special handling if needed for 7-day view
          console.log('Using daily data for 7-day view:', formattedData);
        } 
        // For 30-day view, just use the data as is
        else if (period === '30d') {
          console.log('Using monthly data for 30-day view:', formattedData);
        }
        
        // Sort data chronologically
        formattedData.sort((a, b) => a.date.localeCompare(b.date));
        
        // If we have no data or only one point, create a zero point to show the chart properly
        if (formattedData.length === 0) {
          formattedData = [{ date: '', desktop: 0 }];
        } else if (formattedData.length === 1) {
          const singlePoint = formattedData[0];
          formattedData = [
            { date: '', desktop: 0 },
            singlePoint
          ];
        }
        
        // Update data without triggering a full re-render
        setChartData(formattedData);
        
        // Calculate total credits
        const total = dataArray.reduce((sum: number, item: CreditUsageDataItem) => 
          sum + (parseFloat(item.totalAmount) || 0), 0);
        setTotalCredits(total.toFixed(4)); // Format to 4 decimal places
        
        // Update last fetch time
        setLastFetchTime(prev => Date.now());
      }
    } catch (error) {
      console.error("Error refreshing credits usage data:", error);
    }
  }, []);

  // Handle time range change
  const handleTimeRange = (value: string) => {
    setTimeRange(value);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    fetchData(value);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(timeRange);
  }, [fetchData, timeRange]);
  
  // Set up refresh interval
  useEffect(() => {
    // Set different refresh intervals based on the time range
    let refreshInterval = 60000; // Default to 1 minute
    
    if (timeRange === '1d') {
      refreshInterval = 5000; // 30 seconds for 1-day view
    } else if (timeRange === '7d') {
      refreshInterval = 5000; // 1 minute for 7-day view
    } else {
      refreshInterval = 5000; // 2 minutes for 30-day view
    }
    
    // Set up interval for periodic refreshes
    intervalRef.current = setInterval(() => {
      console.log(`Auto-refreshing chart data for ${timeRange}...`);
      refreshData(timeRange);
    }, refreshInterval);
    
    // Clean up interval on unmount or when timeRange changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRange, refreshData]);
  
  // Get date range description based on selected time period
  const getDateRangeDescription = () => {
    if (timeRange === '1d') {
      return `Last 24 hours`;
    } else if (timeRange === '7d') {
      return `Last 7 days`;
    } else {
      return `Last 30 days`;
    }
  };

  return (
    <Card className="w-full xl:w-2/5 items-center justify-between rounded-md border-zinc-200 bg-clip-border dark:border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold leading-6 text-foreground dark:text-white">
              Credit usage
            </CardTitle>
            <CardDescription className="text-xs font-medium leading-5 text-zinc-500 dark:text-zinc-400">
              {getDateRangeDescription()}
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRange}>
            <SelectTrigger
              className="w-[120px] rounded-md text-foreground dark:text-white"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-lg z-10 bg-white dark:bg-zinc-950 dark:border-zinc-800">
              <SelectItem value="30d" className="rounded-md text-foreground dark:text-white hover:dark:text-white">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-md text-foreground dark:text-white hover:dark:text-white">
                Last 7 days
              </SelectItem>
              <SelectItem value="1d" className="rounded-md text-foreground dark:text-white hover:dark:text-white">
                Last 1 day
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-[300px] xl:h-[200px] 2xl:h-[250px] w-full"
          config={chartConfig}
        >
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading chart data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available for the selected period</p>
            </div>
          ) : (
            <BarChart 
              accessibilityLayer 
              data={chartData}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => formatDate(value, timeRange)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    indicator="dashed"
                    labelFormatter={(value) => formatDate(value, timeRange)}
                  />
                }
              />
              <Bar 
                dataKey="desktop" 
                fill="var(--chart-1)" 
                radius={4} 
                isAnimationActive={true}
              />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 text-base text-foreground dark:text-white font-medium leading-none">
          {isLoading ? 'Loading...' : `${totalCredits} credits used`} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Showing credits usage for the {getDateRangeDescription().toLowerCase()}
        </div>
      </CardFooter>
    </Card>
  );
}
