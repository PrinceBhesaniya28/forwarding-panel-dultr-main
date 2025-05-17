'use client';

import {
  renderThumb,
  renderTrack,
  renderView
} from '@/components/scrollbar/Scrollbar';
import Links from '@/components/sidebar/components/Links';
import SidebarCard from '@/components/sidebar/components/SidebarCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  OpenContext,
  UserContext,
  UserDetailsContext
} from '@/contexts/layout';
import { IRoute } from '@/types/types';
import { Database } from '@/types/types_db';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { getErrorRedirect } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useContext, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { HiX } from 'react-icons/hi';
import { HiBolt, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { Button } from '../ui/button';
export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

type Price = Database['public']['Tables']['prices']['Row'];

function Sidebar(props: SidebarProps) {
  const router = useRouter(); // Always call `useRouter` at the top level
  const shouldUseRouter = getRedirectMethod() === 'client';
  const { routes } = props;
  const { open, setOpen } = useContext(OpenContext);
  const user = useContext(UserContext);
  const userDetails = useContext(UserDetailsContext);
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const modePathname = usePathname();
  const currentPath = usePathname(); // Always call hooks at the top level

  const handleCheckout = async (price: Price) => {
    try {
      setPriceIdLoading(price.id); // Start loading state

      // Check if the user is logged in
      if (!user) {
        setPriceIdLoading(undefined); // Clear loading state
        router.push('/dashboard/signin/signup'); // Redirect to sign-in page
        return;
      }

      // Proceed with Stripe checkout
      const { errorRedirect, sessionId } = await checkoutWithStripe(
        price,
        currentPath
      );

      // Handle error redirects
      if (errorRedirect) {
        setPriceIdLoading(undefined);
        router.push(errorRedirect);
        return;
      }

      // Handle missing session ID
      if (!sessionId) {
        setPriceIdLoading(undefined);
        router.push(
          getErrorRedirect(
            currentPath,
            'An unknown error occurred.',
            'Please try again later or contact a system administrator.'
          )
        );
        return;
      }

      // Success case (if needed, you can add logic here for successful checkout)
    } catch (error) {
      console.error('Error during checkout:', error);
      setPriceIdLoading(undefined); // Clear loading state in case of an error
    } finally {
      // Ensure any necessary cleanup here
    }
  };

  // SIDEBAR
  return (
    <div
      className={`lg:!z-99 fixed !z-[99] min-h-full w-[300px] transition-all md:!z-[99] xl:!z-0 ${
        props.variant === 'auth' ? 'xl:hidden' : 'xl:block'
      } ${open ? '' : '-translate-x-[120%] xl:translate-x-[unset]'}`}
    >
      <Card
        className={`m-3 ml-3 h-[96.5vh] w-full !rounded-md border-zinc-200 pe-4 dark:border-zinc-800 sm:my-4 sm:mr-4 md:m-5 md:mr-[-50px] flex flex-col`}
      >
        <div className="relative flex-grow overflow-hidden">
          <span
            className="absolute top-4 right-4 z-10 block cursor-pointer text-zinc-200 dark:text-white/40 xl:hidden"
            onClick={() => setOpen(false)}
          >
            <HiX />
          </span>
          <div className={`mt-8 flex items-center justify-center`}>
            <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <HiBolt className="h-5 w-5" />
            </div>
            <h5 className="text-2xl font-bold leading-5 text-foreground dark:text-white">
              Dialo Portal
            </h5>
          </div>
          <div className="mb-8 mt-8 h-px bg-zinc-200 dark:bg-white/10" />
          
          <Scrollbars
            autoHide
            renderTrackVertical={renderTrack}
            renderThumbVertical={renderThumb}
            renderView={renderView}
            universal={true}
            style={{ height: 'calc(100vh - 275px)' }}
          >
            {/* Nav item */}
            <ul className="pe-4">
              <Links routes={routes} />
            </ul>
            
            {/* Free Horizon Card */}
            <div className="mb-6 mt-6">
              <div className="flex justify-center">
                <SidebarCard handleCheckout={handleCheckout} />
              </div>
            </div>
          </Scrollbars>
          
          {/* Sidebar profile info - Fixed at bottom */}
          <div className="mt-4 ml-4 mx-auto w-70 flex items-center rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <Link href="/dashboard/main">
              <Avatar className="min-h-10 min-w-10 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="font-bold dark:text-foreground">
                  {userDetails?.full_name
                    ? userDetails.full_name.charAt(0).toUpperCase()
                    : user?.user_metadata?.full_name
                    ? user.user_metadata.full_name.charAt(0).toUpperCase()
                    : user?.user_metadata?.name
                    ? user.user_metadata.name.charAt(0).toUpperCase()
                    : user?.user_metadata?.email
                    ? user.user_metadata.email.charAt(0).toUpperCase()
                    : 'D'}
                </AvatarFallback>
              </Avatar>
            </Link>

            <Link href="/dashboard/main" className="min-w-0 flex-1">
              <p className="ml-2 truncate text-sm font-semibold leading-none text-foreground dark:text-white">
                LogOut
                {/* {userDetails?.full_name 
                  ? userDetails.full_name
                  : user?.user_metadata?.full_name
                  ? user.user_metadata.full_name
                  : user?.user_metadata?.name
                  ? user.user_metadata.name
                  : user?.user_metadata?.email
                  ? user.user_metadata.email
                  : "User"} */}
              </p>
            </Link>
            <form
              className="flex-shrink-0"
              onSubmit={(e) => {
                // Clear all auth data before submitting
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userRole');
                // Clear all cookies
                document.cookie.split(";").forEach(function(c) { 
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                // Submit the form
                handleRequest(e, SignOut, router);
              }}
            >
              <input type="hidden" name="pathName" value={modePathname} />
              <Button
                variant="outline"
                className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full p-0 text-center text-sm font-medium hover:dark:text-white"
                type="submit"
              >
                <HiOutlineArrowRightOnRectangle
                  className="h-4 w-4 stroke-2 text-foreground dark:text-white"
                  width="16px"
                  height="16px"
                  color="inherit"
                />
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}

// PROPS

export default Sidebar;
