'use client';

/* eslint-disable */
import NavLink from '@/components/link/NavLink';
import Link from 'next/link';
import AdminNavbarLinks from './NavbarLinksAdmin';

export default function AdminNavbar(props: {
  brandText: string;
  [x: string]: any;
}) {
  const { brandText } = props;

  return (
    <nav
      className={`fixed right-3 top-3 z-[0] flex w-[calc(100vw_-_6%)] flex-row items-center justify-between rounded-md bg-white/30 py-2 backdrop-blur-xl transition-all dark:bg-transparent md:right-[30px] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2 lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)] 2xl:w-[calc(100vw_-_380px)]`}
    >
      <div className="ml-[6px]">
        <div className="h-6 md:mb-2 md:w-[224px] md:pt-1">
          <Link
            className="hidden text-xs font-normal text-foreground hover:underline dark:text-white dark:hover:text-white md:inline"
            href=""
          >
            Pages
            <span className="mx-1 text-xs text-foreground hover:text-foreground dark:text-white">
              {' '}
              /{' '}
            </span>
          </Link>
          <NavLink
            className="text-xs font-normal capitalize text-foreground hover:underline dark:text-white dark:hover:text-white"
            href="#"
          >
            {brandText}
          </NavLink>
        </div>
        <p className="text-md shrink capitalize text-foreground dark:text-white md:text-3xl">
          <NavLink
            href="#"
            className="font-bold capitalize hover:text-foreground dark:hover:text-white"
          >
            {brandText}
          </NavLink>
        </p>
      </div>
      <div className="w-[154px] min-w-max md:ml-auto md:w-[unset]">
        <AdminNavbarLinks />
      </div>
    </nav>
  );
}
