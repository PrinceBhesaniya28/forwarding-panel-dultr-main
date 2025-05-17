'use client';

import { Badge } from '@/components/ui/badge';
import herodark from '@/public/img/dark/hero/hero-image.png';
import herolight from '@/public/img/light/hero/hero-image.png';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function Hero() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="relative mx-auto mt-12 flex w-[96vw] flex-col content-center items-center rounded-lg 
   bg-[linear-gradient(180deg,_#FFF_0%,_#F4F4F5_100%)] dark:bg-[linear-gradient(180deg,_rgba(255,_255,_255,_0.00)_0%,_rgba(255,_255,_255,_0.10)_100%)] md:mt-[90px]
   md:rounded-2xl lg:mt-[103px] 2xl:w-[94vw]"
    >
      <div className="flex w-full">
        <div className="3xl:pt-[200px] mb-0 flex w-[stretch] max-w-full flex-row content-center items-center justify-between pt-20 lg:pt-[120px]">
          <div className="mx-auto flex w-full flex-col text-center">
            <Badge
              variant="outline"
              className="mx-auto w-max px-4 py-2 text-foreground dark:border-none dark:bg-zinc-800 dark:text-white"
            >
              Introducing: Horizon UI Boilerplate x shadcn/ui
            </Badge>
            <h1 className="3xl:text-6xl z-[40] mx-auto mb-6 mt-4 max-w-[94%] text-3xl font-bold leading-[36px] text-foreground dark:text-white md:max-w-[70%] md:text-[50px] md:leading-[60px] lg:max-w-[76%] lg:text-[50px] lg:leading-[68px] xl:max-w-[60%] 2xl:max-w-[48%] 2xl:text-[50px] 2xl:leading-[68px]">
              Launch your startup project 10X faster in a few moments
            </h1>
            <h5 className="mb-8 w-[96%] self-center text-base font-normal leading-8 text-foreground dark:text-zinc-400 md:mb-10 md:w-[82%] lg:w-[62%] xl:w-[50%] xl:text-lg xl:leading-[32px] 2xl:w-[44%] 2xl:text-lg 2xl:leading-[32px]">
              Create a professional website for your startup in no time with
              Horizon UI Boilerplate. Our comprehensive template will help you
              launch your project 10X faster, leaving you more time to focus on
              your business.
            </h5>
            <div className="mx-auto flex items-center justify-center">
              <Link className="me-2 md:me-5" href="/dashboard/main">
                <Button className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium md:mb-0">
                  Explore the Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/main">
                <Button
                  variant="outline"
                  className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium dark:text-white md:mb-0"
                >
                  See pricing Plans
                </Button>
              </Link>
            </div>
            <div className="relative mx-auto flex max-w-[335px] justify-center md:mt-[10px] md:max-w-[660px] lg:mt-[80px] lg:max-w-[900px] xl:max-w-[1170px]">
              <Image
                src={theme === 'dark' ? herodark.src : herolight.src}
                width={1164}
                height={692}
                alt=""
                className="mt-10 max-h-max w-full max-w-[335px] md:mt-12 md:max-w-[660px] lg:mt-0 lg:max-w-[900px] xl:max-w-[1170px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
