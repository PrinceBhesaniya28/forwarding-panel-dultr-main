/* eslint-disable */
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  HiBolt,
  HiOutlineGlobeEuropeAfrica,
  HiOutlineMoon,
  HiOutlineShieldCheck,
  HiOutlineSun,
  HiStar
} from 'react-icons/hi2';
import { IoMenuOutline } from 'react-icons/io5';

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    window.addEventListener('scroll', changeNavbar);

    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  });
  const { secondary, message } = props;

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  if (!mounted) {
    return null;
  }
  return (
    <div
      className={`fixed left-[50%] top-0 z-[49] mx-auto flex w-full translate-x-[-50%] translate-y-0 flex-col items-center border-gray-300 bg-white leading-[25.6px] dark:border-white dark:bg-zinc-950 xl:justify-center`}
    >
      <div className="hidden w-full justify-center bg-zinc-100 dark:bg-zinc-900 lg:flex">
        <div className="flex w-[calc(100vw_-_4%)] justify-center gap-[40px] py-3 sm:px-4 md:w-[calc(100vw_-_4%)] md:px-2.5 lg:w-[100vw] lg:px-3 xl:w-[calc(100vw_-_250px)] 2xl:w-[1200px]">
          <div className="flex flex-row items-center">
            <HiOutlineShieldCheck
              className="
            mr-1.5 h-3 w-3 stroke-2 text-foreground dark:text-white"
            />
            <p className="h-full text-xs font-medium text-foreground dark:text-white">
              Founded in EU. We respect your privacy.
            </p>
          </div>
          <div className="flex flex-row items-center">
            <HiStar
              className="
            mr-[1px] h-3 w-3 text-foreground dark:text-white"
            />
            <HiStar
              className="
            mr-[1px] h-3 w-3 text-foreground dark:text-white"
            />
            <HiStar
              className="
            mr-[1px] h-3 w-3 text-foreground dark:text-white"
            />
            <HiStar
              className="
            mr-[1px] h-3 w-3 text-foreground dark:text-white"
            />
            <HiStar
              className="
            mr-[4px] h-3 w-3 text-foreground dark:text-white"
            />
            <p className="h-full text-xs font-medium text-foreground dark:text-white">
              Loved by 80,000+ users worldwide
            </p>
          </div>
          <div className="flex flex-row items-center">
            <HiOutlineGlobeEuropeAfrica
              className="
            mr-1.5 h-3 w-3 text-foreground dark:text-white"
            />
            <p className="h-full text-xs font-medium text-foreground dark:text-white">
              #1 ShadCN UI Template & Boilerplate
            </p>
          </div>
        </div>
      </div>

      {/* Misc */}

      <div className="mb-0 flex w-[calc(100vw_-_4%)] flex-row items-center justify-between gap-[40px] py-5 sm:px-6 md:w-[calc(100vw_-_4%)] md:px-2.5 lg:w-[100vw] lg:px-3 xl:w-[calc(100vw_-_250px)] xl:pl-3 2xl:w-[1200px]">
        <Link className="flex items-center justify-center" href="/dashboard/main">
          <div className={`flex items-center justify-center`}>
            <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <HiBolt className="h-5 w-5" />
            </div>
            <h5 className="text-2xl font-bold leading-5 text-foreground dark:text-white">
              Horizon AI
            </h5>
          </div>
        </Link>
        <div className="flex items-center">
          <Link
            className="my-auto mr-[30px] hidden text-sm font-medium leading-[0px] text-foreground dark:text-white lg:block"
            href="/dashboard/main"
          >
            Dashboard
          </Link>
          <Link
            className="my-auto mr-[30px] hidden text-sm font-medium leading-[0px] text-foreground dark:text-white lg:block"
            href="/#features"
          >
            Features
          </Link>
          <Link
            className="my-auto mr-[30px] hidden text-sm font-medium leading-[0px] text-foreground dark:text-white lg:block"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="my-auto mr-[30px] hidden text-sm font-medium leading-[0px] text-foreground dark:text-white lg:block"
            href="#faqs"
          >
            FAQs
          </Link>
          <Button
            variant="outline"
            className="me-3 flex min-h-10 min-w-10 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white lg:hidden"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'light' ? (
              <HiOutlineMoon className="h-4 w-4 stroke-2" />
            ) : (
              <HiOutlineSun className="h-5 w-5 stroke-2" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="block lg:hidden">
                <IoMenuOutline className="block h-5 w-5 cursor-pointer text-foreground dark:text-white lg:hidden" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[80] w-56 border-zinc-200 dark:border-zinc-800">
              <DropdownMenuItem>
                <Link
                  className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
                  href="/dashboard/main"
                >
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/signin"
                  className="text-md my-auto mr-[30px] font-semibold text-foreground dark:text-white"
                >
                  Login
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link
                    href="/#features"
                    className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
                  >
                    Features
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/pricing"
                    className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
                  >
                    Pricing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="#faqs"
                    className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
                  >
                    FAQs
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              <DropdownMenuItem>
                <button className="my-auto rounded-md border border-gray-300 bg-[transparent] px-2 py-2 text-sm font-semibold text-foreground dark:border-white dark:text-white">
                  <Link
                    className="flex flex-row justify-center"
                    href="/dashboard/signin"
                  >
                    Get started for Free
                  </Link>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden items-center lg:flex">
          <Button
            variant="outline"
            className="me-3 flex min-h-10 min-w-10 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'light' ? (
              <HiOutlineMoon className="h-4 w-4 stroke-2" />
            ) : (
              <HiOutlineSun className="h-5 w-5 stroke-2" />
            )}
          </Button>
          <Link
            className="my-auto mr-[18px] text-sm font-semibold text-foreground dark:text-white"
            href="/dashboard/signin"
          >
            Login
          </Link>
          <Link href="/dashboard/signin" className="flex">
            <Button variant="outline" className="py-6 dark:text-white">
              Get started for Free
            </Button>
          </Link>
        </div>
      </div>
      {secondary ? <p className="text-white">{message}</p> : null}
    </div>
  );
}
