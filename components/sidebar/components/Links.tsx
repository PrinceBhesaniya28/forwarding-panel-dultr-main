'use client';

/* eslint-disable */
import NavLink from '@/components/link/NavLink';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  PlanContext,
  ProductsContext,
  SubscriptionContext
} from '@/contexts/layout';
import modalImagedark from '@/public/img/dark/modal/modal.png';
import modalImage from '@/public/img/light/modal/modal.png';
import { IRoute } from '@/types/types';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { BiSolidCheckSquare } from 'react-icons/bi';
import { FaCircle } from 'react-icons/fa';
import { IoIosStar, IoMdAdd } from 'react-icons/io';
import { getUserRole } from '@/utils/auth';

// Helper function to check if user is admin
function isUserAdmin() {
  // Only run on client side
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userRole = getUserRole();
  console.log('Current user role from getUserRole:', userRole); // Debug log
  return userRole === 'admin';
}

// Helper function to check if user has access to a route
function hasRouteAccess(route: IRoute) {
  // Only run on client side
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userRole = getUserRole();
  // If no roles specified, allow access
  if (!route.roles) return true;
  // If user has no role, deny access
  if (!userRole) return false;
  // Check if user's role is in the allowed roles
  return route.roles.includes(userRole);
}

interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

export function SidebarLinks(props: SidebarLinksProps) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  const { plan, setPlan } = useContext(PlanContext);
  const products = useContext(ProductsContext);
  const subscription = useContext(SubscriptionContext);

  const { routes, onOpen } = props;
  
  // Check admin status on component mount
  useEffect(() => {
    const adminStatus = isUserAdmin();
    console.log('Admin status on mount:', adminStatus);
    setIsAdmin(adminStatus);
  }, []);

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname]
  );
  const activeLayout = useCallback(
    (routeName: string) => {
      return pathname?.includes('/ai');
    },
    [pathname]
  );

  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, key) => {
      // Skip routes that user doesn't have access to
      if (!hasRouteAccess(route)) {
        return null;
      }

      if (route.collapse && !route.invisible) {
        return (
          <Accordion type="multiple" key={key}>
            <AccordionItem
              className="max-w-[266px] border-0"
              value="1"
              key={key}
            >
              <AccordionTrigger
                className={`ms-0 mt-0 flex w-full max-w-[266px] items-center justify-center rounded-md pb-2.5 pe-3 pt-2.5 decoration-transparent ${
                  activeLayout(route.path.toLowerCase())
                    ? 'max-w-[266px] bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-foreground dark:text-white'
                }`}
                // _hover={{
                //   bg: 'unset',
                // }}
                // _focus={{
                //   boxShadow: 'none',
                // }}
              >
                {route.icon ? (
                  <div
                    className={`flex w-full max-w-full items-center ${
                      activeLayout(route.path.toLowerCase())
                        ? ' text-white dark:text-zinc-950'
                        : 'text-foreground dark:text-white'
                    } justify-between pl-8 pr-7 `}
                  >
                    <div className="flex w-full items-center justify-center">
                      <div
                        className={`text mr-3 mt-1 ${
                          activeLayout(route.path.toLowerCase())
                            ? 'text-whitedark:text-zinc-950'
                            : 'text-foreground dark:text-white'
                        } `}
                      >
                        {route.icon}
                      </div>
                      <p
                        className={`mr-auto text-sm font-medium ${
                          activeLayout(route.path.toLowerCase())
                            ? 'font-semibold'
                            : 'font-medium'
                        }`}
                      >
                        {route.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-center pb-2.5 pl-8 pt-0">
                    <p
                      className={`mr-auto text-sm font-medium ${
                        activeRoute(route.path.toLowerCase())
                          ? 'text-foreground dark:text-white'
                          : 'text-foreground dark:text-zinc-400'
                      }`}
                    >
                      {route.name}
                    </p>
                  </div>
                )}
              </AccordionTrigger>
              <AccordionContent className="py-0 ps-8">
                <ul className="mt-2">
                  {
                    route.icon && route.items
                      ? createLinks(route.items) // for bullet accordion links
                      : route.items
                      ? createAccordionLinks(route.items)
                      : '' // for non-bullet accordion links
                  }
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      } else if (!route.invisible) {
        return (
          <div key={key} suppressHydrationWarning>
            {route.icon ? (
              <div
                className={`flex w-full max-w-[266px] items-center justify-between rounded-md py-3 pl-8 ${
                  activeRoute(route.path.toLowerCase())
                    ? 'bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950'
                    : 'font-medium text-foreground dark:text-zinc-400'
                }`}
              >
                {route.path.includes('premium') && !subscription ? (
                  <div className="flex w-full">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="w-full cursor-pointer">
                          <div className="flex w-[98%] max-w-[98%] items-center justify-center">
                            <div className="flex w-full items-center justify-center">
                              <div
                                className={`text mr-3 mt-1.5 ${
                                  activeRoute(route.path.toLowerCase())
                                    ? 'font-semibold text-white dark:text-zinc-950'
                                    : 'text-foreground dark:text-white'
                                } `}
                              >
                                {route.icon}
                              </div>
                              <p
                                className={`mr-auto text-sm ${
                                  activeRoute(route.path.toLowerCase())
                                    ? 'font-semibold text-white dark:text-zinc-950'
                                    : 'font-medium text-foreground dark:text-zinc-400'
                                }`}
                              >
                                {route.name}
                              </p>
                            </div>
                            {route.rightElement ? (
                              <div className="ml-auto mr-2.5 h-[34px] w-[34px] items-center justify-center rounded-md border border-zinc-200 text-foreground dark:border-white/30 dark:text-white">
                                <IoMdAdd className="h-5 w-5 text-inherit" />
                              </div>
                            ) : null}
                            <div className="bg-brand-500 dark:bg-brand-400 flex rounded-md bg-opacity-20 px-2 py-0.5 text-sm font-semibold text-foreground lg:hidden xl:flex">
                              PRO
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="min-w-max border-0 bg-white p-0 dark:bg-zinc-900">
                        <div className="hidden">
                          <DialogTitle></DialogTitle>
                        </div>
                        <div className="flex">
                          <Image
                            width="340"
                            height="681"
                            src={
                              theme === 'dark'
                                ? modalImagedark.src
                                : modalImage.src
                            }
                            className="z-[100] hidden w-[340px] rounded-l-[16px] md:block"
                            alt="avatar"
                          />
                          <div className="dark:!bg-navy-800 flex flex-col rounded-l-xl rounded-r-xl bg-white px-[30px] py-[34px] dark:bg-zinc-900 md:w-[412px] md:min-w-[412px] md:rounded-l-[0px] md:px-[42px] lg:w-[456px] lg:min-w-[456px]">
                            <p className="mb-3 text-[26px] font-extrabold text-foreground dark:text-white">
                              Upgrade to Unlimited
                            </p>
                            <p className="mb-6 font-medium text-foreground dark:text-zinc-400">
                              Join 80,000+ users now
                            </p>
                            {/* Features */}
                            <div className="flex w-full flex-col xl:w-[80%]">
                              <div className="mb-5 flex items-center">
                                <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
                                <span className="text-sm font-medium text-foreground dark:text-white">
                                  Access to 12+ Essay types
                                </span>
                              </div>
                              <div className="mb-5 flex items-center">
                                <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
                                <span className="text-sm font-medium text-foreground dark:text-white">
                                  Up to 1500 words per Essay
                                </span>
                              </div>
                              <div className="mb-5 flex items-center">
                                <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
                                <span className="text-sm font-medium text-foreground dark:text-white">
                                  Academic Citation formats (APA, etc.)
                                </span>
                              </div>
                              <div className="mb-5 flex items-center">
                                <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
                                <span className="text-sm font-medium text-foreground dark:text-white">
                                  Academic Levels (Master, etc.)
                                </span>
                              </div>
                              <div className="mb-6 flex items-center">
                                <BiSolidCheckSquare className="mr-2.5 h-[20px] w-[20px] text-foreground dark:text-white" />
                                <span className="text-sm font-medium text-foreground dark:text-white">
                                  Essay Tones (Academic, etc.)
                                </span>
                              </div>
                            </div>
                            {/* YEARLY */}
                            <div
                              className={`relative flex items-center border ${
                                plan.product === 'prod_QfhcnVrnDf2I75'
                                  ? 'border-zinc-950 dark:border-white'
                                  : 'border-zinc-200 dark:border-zinc-800'
                              } mb-5 w-full cursor-pointer rounded-md px-4 py-[14px]`}
                              onClick={() =>
                                setPlan({
                                  product: 'prod_QfhcnVrnDf2I75',
                                  price: 'price_1PoMDDDWNoHJSR0zjpoiLOzj'
                                })
                              }
                            >
                              <p className="mb-0.5 ml-2 mr-2 text-sm font-bold text-foreground dark:text-white">
                                Yearly
                              </p>
                              <Badge className="flex rounded-full bg-green-500 px-2 py-0.5 text-sm font-bold text-foreground dark:text-white lg:hidden xl:flex">
                                Save 35%
                              </Badge>
                              <p className="ml-auto flex font-medium text-foreground dark:text-white">
                                $69
                                <span className="ml-1 mt-0.5 text-sm font-medium text-foreground dark:text-zinc-400">
                                  /year
                                </span>
                              </p>
                            </div>
                            {/* END YEARLY */}
                            {/* MONTHLY */}
                            <div
                              className={`relative flex items-center border ${
                                plan.product === 'prod_QfhYC6AAtI5IKW'
                                  ? 'border-zinc-950 dark:border-white'
                                  : 'border-zinc-200 dark:border-zinc-800'
                              } mb-7 w-full cursor-pointer rounded-md px-4 py-[14px]`}
                              onClick={() =>
                                setPlan({
                                  product: 'prod_QfhYC6AAtI5IKW',
                                  price: 'price_1PoM9GDWNoHJSR0zmwpicH8y'
                                })
                              }
                            >
                              <p className="mb-0.5 ml-2 mr-2 text-sm font-bold text-foreground dark:text-white">
                                Monthly
                              </p>
                              <p className="ml-auto flex font-medium text-foreground dark:text-white">
                                $9
                                <span className="ml-1 mt-0.5 text-sm font-medium text-foreground dark:text-zinc-400">
                                  /month
                                </span>
                              </p>
                            </div>
                            <Button className="mb-7 flex w-full items-center justify-center rounded-md px-4 py-5 text-sm font-medium">
                              Upgrade now
                            </Button>
                            {/* END MONTHLY */}
                            {products.map((product: any, key: number) => {
                              const price = product?.prices?.find(
                                (price: any) => price.id === plan.price
                              );
                              if (product.id === plan.product) {
                                if (!price) return null;
                                return (
                                  <Button
                                    key={key}
                                    className="mb-7 flex w-full items-center justify-center rounded-md px-4 py-5 text-sm font-medium"
                                    onClick={() => props.handleCheckout(price)}
                                  >
                                    Upgrade now
                                  </Button>
                                );
                              }
                            })}
                            <p className="mx-auto mb-[5px] text-xs font-semibold text-foreground dark:text-zinc-400">
                              Used by 80,000+ customers monthly
                            </p>
                            <div className="mx-auto flex flex-row items-center">
                              <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
                              <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
                              <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
                              <IoIosStar className="mr-[1px] h-4 w-4 text-orange-500" />
                              <IoIosStar className="mr-1.5 h-4 w-4 text-orange-500" />
                              <p className="h-full text-sm  font-extrabold text-foreground dark:text-white">
                                4.9
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <NavLink
                    href={route.layout ? route.layout + route.path : route.path}
                    key={key}
                    styles={{ width: '100%' }}
                  >
                    <div className="w-full items-center justify-center">
                      <div className="flex w-full items-center justify-center">
                        <div
                          className={`text mr-3 mt-1.5 ${
                            activeRoute(route.path.toLowerCase())
                              ? 'font-semibold text-white dark:text-zinc-950'
                              : 'text-foreground dark:text-white'
                          } `}
                        >
                          {route.icon}
                        </div>
                        <p
                          className={`mr-auto text-sm ${
                            activeRoute(route.path.toLowerCase())
                              ? 'font-semibold text-white dark:text-zinc-950'
                              : 'font-medium text-foreground dark:text-zinc-400'
                          }`}
                        >
                          {route.name}
                        </p>
                      </div>
                      {route.rightElement ? (
                        <div className="ml-auto mr-2.5 h-[34px] w-[34px] items-center justify-center rounded-md border border-zinc-200 text-foreground dark:border-white/30 dark:text-white">
                          <IoMdAdd className="h-5 w-5 text-inherit" />
                        </div>
                      ) : null}
                    </div>
                  </NavLink>
                )}
              </div>
            ) : (
              <li className="ml-0">
                <div className="mb-2 items-center pl-8">
                  <NavLink
                    href={route.layout ? route.layout + route.path : route.path}
                    key={key}
                  >
                    <p
                      className={`text-xs ${
                        activeRoute(route.path.toLowerCase())
                          ? 'font-semibold text-foreground dark:text-white'
                          : 'font-medium text-foreground dark:text-white'
                      }`}
                    >
                      {route.name}
                    </p>
                  </NavLink>
                </div>
              </li>
            )}
          </div>
        );
      }
    });
  };
  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createAccordionLinks = (routes: IRoute[]) => {
    return routes.map((route: IRoute, key: number) => {
      return (
        <li className="mb-2.5 ml-[28px] flex max-w-full items-center" key={key}>
          <NavLink href={route.layout + route.path} key={key}>
            <FaCircle className="mr-2 h-1.5 w-1.5 text-foreground dark:text-white" />
            <p
              className={`text-xs ${
                activeRoute(route.path.toLowerCase()) ? 'font-semibold' : ''
              } ${
                activeRoute(route.path.toLowerCase())
                  ? 'text-foreground dark:text-white'
                  : 'text-foreground dark:text-white'
              }`}
            >
              {route.name}
            </p>
          </NavLink>
        </li>
      );
    });
  };
  //  BRAND
  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;
