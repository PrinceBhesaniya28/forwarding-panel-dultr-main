'use client';

import { TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';

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
interface CallRecordDataItem {
  date?: string; // New format will use 'date' instead of 'month'
  month?: string; // Keep for backward compatibility
  totalCalls: number;
  answeredCalls: string;
  unansweredCalls: string;
  failedCalls: string;
}

// Transform API data to chart format
interface ChartDataItem {
  date: string; // Standardized date field
  answeredCalls: number;
  unansweredCalls: number;
  failedCalls: number;
}

const chartConfig = {
  answeredCalls: {
    label: 'Answered Calls',
    color: '#10B981' // Green
  },
  unansweredCalls: {
    label: 'Unanswered Calls',
    color: '#F59E0B' // Amber/Orange
  },
  failedCalls: {
    label: 'Failed Calls',
    color: '#EF4444' // Red
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

export default function AreaChartComponent() {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [totalCalls, setTotalCalls] = useState("0");
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
      query.append('period', period); // Add period param
      query.append('_', Date.now().toString()); // Cache buster
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/dashboard/call-record-graph?${query.toString()}`, {
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
        console.log('Data from API:', dataArray);
        
        // Transform data for the chart with proper type handling
        let formattedData = dataArray.map((item: CallRecordDataItem) => {
          // Log to identify any issues
          console.log('Raw item:', item);
          
          return {
            date: item.date || item.month || '', // Use date field if available, otherwise fall back to month
            answeredCalls: Number(item.answeredCalls) || 0,
            unansweredCalls: Number(item.unansweredCalls) || 0,
            failedCalls: Number(item.failedCalls) || 0
          };
        });

        console.log('Formatted data:', formattedData);

        // Sort data chronologically
        formattedData.sort((a, b) => a.date.localeCompare(b.date));
        
        // If it's 7d or 30d view and we only have one data point, 
        // create artificial points to make the chart visible
        if ((period === '7d' || period === '30d') && formattedData.length === 1) {
          const dataPoint = formattedData[0];
          
          // Create a start date with zero values
          const zeroPoint = {
            date: '',
            answeredCalls: 0,
            unansweredCalls: 0,
            failedCalls: 0
          };
          
          formattedData = [zeroPoint, dataPoint];
        } else {
          // Create initial zero point for the first date if needed
          if (formattedData.length > 0) {
            const zeroPoint = {
              date: '',
              answeredCalls: 0,
              unansweredCalls: 0,
              failedCalls: 0
            };
            formattedData = [zeroPoint, ...formattedData];
          }
        }
        
        // When only one data point exists (plus our zero point), don't accumulate
        let finalData;
        if (formattedData.length === 2) {
          finalData = formattedData;
          console.log('Using direct values for single data point chart:', finalData);
        } else {
          // Accumulate values across time periods (running total)
          finalData = formattedData.reduce((acc: ChartDataItem[], current, index) => {
            if (index === 0) {
              // First item (zero) as is
              acc.push({...current});
            } else {
              // For subsequent items, add values from previous period
              const prev = acc[index-1];
              acc.push({
                date: current.date,
                answeredCalls: prev.answeredCalls + current.answeredCalls,
                unansweredCalls: prev.unansweredCalls + current.unansweredCalls,
                failedCalls: prev.failedCalls + current.failedCalls
              });
            }
            return acc;
          }, []);
        }

        console.log('Original data:', formattedData);
        console.log('Final chart data:', finalData);
        
        setChartData(finalData);
        
        // Calculate total calls
        const total = dataArray.reduce((sum: number, item: CallRecordDataItem) => 
          sum + (Number(item.answeredCalls) || 0) + 
          (Number(item.unansweredCalls) || 0) + 
          (Number(item.failedCalls) || 0), 0);
        setTotalCalls(total.toString());
      } else {
        // If no data or error, set empty chart data
        setChartData([]);
        setTotalCalls("0");
      }
    } catch (error) {
      console.error("Error fetching call record data:", error);
      setChartData([]);
      setTotalCalls("0");
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
      query.append('period', period); // Add period param
      query.append('_', Date.now().toString()); // Cache buster
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/dashboard/call-record-graph?${query.toString()}`, {
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
        
        // Transform data for the chart with proper type handling
        let formattedData = dataArray.map((item: CallRecordDataItem) => ({
          date: item.date || item.month || '', // Use date field if available, otherwise fall back to month
          answeredCalls: Number(item.answeredCalls) || 0,
          unansweredCalls: Number(item.unansweredCalls) || 0,
          failedCalls: Number(item.failedCalls) || 0
        }));

        // Sort data chronologically
        formattedData.sort((a, b) => a.date.localeCompare(b.date));
        
        // If it's 7d or 30d view and we only have one data point, 
        // create artificial points to make the chart visible
        if ((period === '7d' || period === '30d') && formattedData.length === 1) {
          const dataPoint = formattedData[0];
          
          // Create a start date with zero values
          const zeroPoint = {
            date: '',
            answeredCalls: 0,
            unansweredCalls: 0,
            failedCalls: 0
          };
          
          formattedData = [zeroPoint, dataPoint];
        } else {
          // Create initial zero point for the first date if needed
          if (formattedData.length > 0) {
            const zeroPoint = {
              date: '',
              answeredCalls: 0,
              unansweredCalls: 0,
              failedCalls: 0
            };
            formattedData = [zeroPoint, ...formattedData];
          }
        }
        
        // When only one data point exists (plus our zero point), don't accumulate
        let finalData;
        if (formattedData.length === 2) {
          finalData = formattedData;
        } else {
          // Accumulate values across time periods (running total)
          finalData = formattedData.reduce((acc: ChartDataItem[], current, index) => {
            if (index === 0) {
              // First item (zero) as is
              acc.push({...current});
            } else {
              // For subsequent items, add values from previous period
              const prev = acc[index-1];
              acc.push({
                date: current.date,
                answeredCalls: prev.answeredCalls + current.answeredCalls,
                unansweredCalls: prev.unansweredCalls + current.unansweredCalls,
                failedCalls: prev.failedCalls + current.failedCalls
              });
            }
            return acc;
          }, []);
        }

        console.log('Refreshed data:', finalData);
        
        // Update data without triggering a full re-render
        setChartData(finalData);
        
        // Calculate total calls
        const total = dataArray.reduce((sum: number, item: CallRecordDataItem) => 
          sum + (Number(item.answeredCalls) || 0) + 
          (Number(item.unansweredCalls) || 0) + 
          (Number(item.failedCalls) || 0), 0);
        setTotalCalls(total.toString());
        
        // Update last fetch time
        setLastFetchTime(prev => Date.now());
      }
    } catch (error) {
      console.error("Error refreshing call record data:", error);
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
      refreshInterval = 5000; // 5 seconds for 1-day view
    } else if (timeRange === '7d') {
      refreshInterval = 5000; // 5 seconds for 7-day view
    } else {
      refreshInterval = 5000; // 5 seconds for 30-day view
    }
    
    // Set up interval for periodic refreshes
    intervalRef.current = setInterval(() => {
      console.log(`Auto-refreshing area chart data for ${timeRange}...`);
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
    <Card className="w-full xl:w-3/5 items-center justify-between rounded-md border-zinc-200 bg-clip-border dark:border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold leading-6 text-foreground dark:text-white">
              Call volume
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
            <AreaChart 
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <defs>
                <linearGradient id="fillAnsweredCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#10B981"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#10B981"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillUnansweredCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#F59E0B"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#F59E0B"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillFailedCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#EF4444"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#EF4444"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => formatDate(value, timeRange)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                domain={[0, 'auto']}
                allowDataOverflow={false}
              />
              <ReferenceLine y={0} stroke="#666" />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    indicator="line" 
                    labelFormatter={(value) => formatDate(value, timeRange)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="answeredCalls"
                stroke="#10B981"
                fill="url(#fillAnsweredCalls)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="unansweredCalls"
                stroke="#F59E0B"
                fill="url(#fillUnansweredCalls)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="failedCalls"
                stroke="#EF4444"
                fill="url(#fillFailedCalls)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 text-base text-foreground dark:text-white font-medium leading-none">
          {isLoading ? 'Loading...' : `${totalCalls} calls recorded`} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Showing call volume for the {getDateRangeDescription().toLowerCase()}
        </div>
      </CardFooter>
    </Card>
  );
}
