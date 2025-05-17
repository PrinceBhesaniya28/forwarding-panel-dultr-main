'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { OpenContext, UserContext } from '@/contexts/layout';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { FiAlignJustify } from 'react-icons/fi';
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineInformationCircle,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineCurrencyDollar,
  HiOutlinePhone
} from 'react-icons/hi2';
import { Input } from '../ui/input';
import { getAuthToken } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import BalanceWarning from '../ui/balance-warning';

// Constants for balance management
const POSTPAID_LIMIT = 100; // Maximum negative balance allowed
const MIN_BALANCE_CHECK_INTERVAL = 10000; // Check every 10 seconds

export default function HeaderLinks() {
  const { open, setOpen } = useContext(OpenContext);
  const user = useContext(UserContext);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userBalance, setUserBalance] = useState("0.00");
  const [numericBalance, setNumericBalance] = useState(0);
  const [minuteRate, setMinuteRate] = useState(0.9); // Default per-minute rate
  const [liveCount, setLiveCount] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const shouldUseRouter = getRedirectMethod() === 'client';
  const currentPath = usePathname();

  const onOpen = () => {
    setOpen(!open);
  };

  // Function to check if balance is low or negative
  const checkBalanceStatus = (balance: number) => {
    // Check if balance is negative (postpaid mode)
    if (balance < 0) {
      // Check if balance is below postpaid limit
      if (Math.abs(balance) >= POSTPAID_LIMIT) {
        // User has reached postpaid limit, account should be disabled
        return 'DISABLE';
      }
      // Show warning for negative balance
      return 'WARNING';
    }
    
    // Check if balance is less than per-minute rate
    if (balance < minuteRate) {
      // Balance too low for calls
      return 'WARNING';
    }
    
    // Balance is sufficient
    return 'OK';
  };

  // Function to perform logout
  const performLogout = async () => {
    console.log('Logging out due to inactive account status');

    // Clear all auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');

    // Clear all cookies
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Close SSE connection if open
    if (eventSource) {
      eventSource.close();
    }

    // Show toast notification
    toast({
      title: 'Session ended',
      description:
        'Your account has been deactivated. Please contact an administrator.',
      variant: 'destructive'
    });

    // Redirect to login page
    if (shouldUseRouter) {
      router.push('/dashboard/signin');
    } else {
      window.location.href = '/dashboard/signin';
    }
  };

  // Set up SSE connection for balance updates
  useEffect(() => {
    setMounted(true);
    setIsLoadingBalance(true);

    const authToken = getAuthToken();
    if (!authToken) {
      setBalanceError(true);
      setIsLoadingBalance(false);
      return;
    }

    const es = new EventSource(`/api/users/balance/sse?token=${authToken}`, {
      withCredentials: true
    });

    es.onopen = () => {
      console.log('Balance SSE connection opened');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('DATA', data);
        
        if (data.success) {
          // Handle new data structure where data is nested
          if (data.data && data.data.data) {
            // Check for multiple data objects (use the latest one)
            if (Array.isArray(data.data.data) && data.data.data.length > 0) {
              const latestData = data.data.data[data.data.data.length - 1];
              // Format balance with 2 decimal places
              const balanceValue = latestData.balance ? parseFloat(latestData.balance) : 0;
              const balance = balanceValue.toFixed(2);
              setUserBalance(balance);
              setNumericBalance(balanceValue);
              
              // Get rate if available
              if (latestData.rate) {
                setMinuteRate(parseFloat(latestData.rate));
              }
              
              // Check if account is inactive (status = 0)
              if (latestData.status === 0) {
                performLogout();
                return;
              }
              
              // Check balance status
              const balanceStatus = checkBalanceStatus(balanceValue);
              if (balanceStatus === 'DISABLE') {
                performLogout();
                return;
              } else if (balanceStatus === 'WARNING') {
                setShowBalanceWarning(true);
              } else {
                setShowBalanceWarning(false);
              }
            }
            
            // Set live call count from the new data structure
            if (data.data.liveCount !== undefined) {
              setLiveCount(data.data.liveCount);
            }
            
            setBalanceError(false);
          } 
          // Fallback to old data structure
          else if (data.data) {
            // Check if account is inactive (status = 0)
            if (data.data.status === 0) {
              performLogout();
              return;
            }
            
            // Format balance with 2 decimal places
            const balanceValue = data.data.balance ? parseFloat(data.data.balance) : 0;
            const balance = balanceValue.toFixed(2);
            setUserBalance(balance);
            setNumericBalance(balanceValue);
            
            // Get rate if available
            if (data.data.rate) {
              setMinuteRate(parseFloat(data.data.rate));
            }
            
            // Check balance status
            const balanceStatus = checkBalanceStatus(balanceValue);
            if (balanceStatus === 'DISABLE') {
              performLogout();
              return;
            } else if (balanceStatus === 'WARNING') {
              setShowBalanceWarning(true);
            } else {
              setShowBalanceWarning(false);
            }
            
            setBalanceError(false);
          } else {
            // No data returned
            setBalanceError(true);
          }
        } else {
          // No success flag
          setBalanceError(true);
          // performLogout();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        setBalanceError(true);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    es.onerror = (error) => {
      console.error('SSE connection error:', error);
      setBalanceError(true);
      setIsLoadingBalance(false);
      // Try to reconnect on error
      es.close();
    };

    setEventSource(es);

    // Clean up the EventSource on component unmount
    return () => {
      if (es) {
        console.log('Closing balance SSE connection');
        es.close();
      }
    };
  }, [router, shouldUseRouter, toast]);

  // Handle closing the balance warning
  const handleCloseBalanceWarning = () => {
    setShowBalanceWarning(false);
    
    // Set a timeout to show it again if the balance is still low
    setTimeout(() => {
      const balanceStatus = checkBalanceStatus(numericBalance);
      if (balanceStatus === 'WARNING') {
        setShowBalanceWarning(true);
      }
    }, MIN_BALANCE_CHECK_INTERVAL);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="relative flex min-w-max max-w-max flex-grow items-center justify-around gap-1 rounded-md md:px-2 md:py-2 md:pl-3 xl:gap-2">
        <Button
          variant="outline"
          className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10 xl:hidden"
          onClick={onOpen}
        >
          <FiAlignJustify className="h-4 w-4" />
        </Button>

        {/* Funds display as single button */}
        <Button
          variant={numericBalance < minuteRate ? "destructive" : "ghost"}
          className="flex items-center gap-1 px-3 h-9 md:min-h-10 text-sm font-medium"
        >
          <HiOutlineCurrencyDollar className="h-4 w-5 flex-shrink-0" />
          <span>
            {isLoadingBalance
              ? 'Loading...'
              : balanceError
                ? 'Funds: --'
                : `Funds: $${userBalance}`}
          </span>
        </Button>
        
        {/* Live Call Count display */}
        <Button
          variant="ghost"
          className="flex items-center gap-1 px-3 h-9 md:min-h-10 text-sm font-medium"
        >
          <HiOutlinePhone className="h-4 w-5 flex-shrink-0" />
          <span>
          {isLoadingBalance ? 'Loading...' : 
            balanceError ? 'Calls: --' : 
            `Calls: ${liveCount}`} 
          </span>
        </Button>
        
        <Button
          variant="outline"
          className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'light' ? (
            <HiOutlineMoon className="h-4 w-4 stroke-2" />
          ) : (
            <HiOutlineSun className="h-5 w-5 stroke-2" />
          )}
        </Button>

        {/* Dropdown Menu */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
            >
              <HiOutlineInformationCircle className="h-[20px] w-[20px] text-foreground dark:text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2 bg-white dark:bg-zinc-950 dark:border-zinc-800">
            <Link target="blank" href="/pricing" className="w-full">
              <Button
                variant="outline"
                className="dark:hover:text-white mb-2 w-full"
              >
                Pricing
              </Button>
            </Link>
            <a target="blank" href="mailto:hello@horizon-ui.com">
              <Button
                variant="outline"
                className="dark:hover:text-white mb-2 w-full"
              >
                Help & Support
              </Button>
            </a>
            <Link target="blank" href="/#faqs">
              <Button variant="outline" className="dark:hover:text-white w-full">
                FAQs & More
              </Button>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu> */}

        <form
          onSubmit={async (e) => {
            // Clear all auth data before submitting
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('userRole');
            // Clear all cookies
            document.cookie.split(';').forEach(function (c) {
              document.cookie = c
                .replace(/^ +/, '')
                .replace(
                  /=.*/,
                  '=;expires=' + new Date().toUTCString() + ';path=/'
                );
            });
            // Submit the form
            shouldUseRouter
              ? handleRequest(e, SignOut, router)
              : await handleRequest(e, SignOut, null);
          }}
        >
          <Input type="hidden" name="pathName" value={currentPath} />
          <Button
            type="submit"
            variant="outline"
            className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
          >
            <HiOutlineArrowRightOnRectangle className="h-4 w-4 stroke-2 text-foreground dark:text-white" />
          </Button>
        </form>

        <Link className="w-full" href="/dashboard/main">
          <Avatar className="h-9 min-w-9 md:min-h-10 md:min-w-10">
            <AvatarImage src={user?.user_metadata.avatar_url} />
            <AvatarFallback className="font-bold">
              {user?.user_metadata.full_name
                ? `${user?.user_metadata.full_name[0]}`
                : `${user?.email[0].toUpperCase()}`}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
      
      {/* Balance Warning Dialog */}
      <BalanceWarning 
        open={showBalanceWarning}
        balance={numericBalance}
        requiredBalance={minuteRate}
        postpaidLimit={POSTPAID_LIMIT}
        onClose={handleCloseBalanceWarning}
      />
    </>
  );
}
