'use client';

import InnerContent from '@/components/layout/innerContent';
import imagedark from '@/public/img/dark/features/feature-two.png';
import image from '@/public/img/light/features/feature-two.png';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function FeatureTwo() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-cover">
      <InnerContent>
        <div className="flex max-w-[1170px] flex-col-reverse items-center justify-between gap-[70px] px-5 md:px-10 lg:flex-row lg:items-start xl:px-0">
          <Image
            src={theme === 'dark' ? imagedark : image}
            width={1150}
            height={1150}
            alt=""
            className="mt-5 w-full md:mt-12 lg:mt-0 lg:w-[415px] xl:w-[575px]"
          />
          <div className="my-auto flex max-w-full flex-col items-center lg:items-start">
            <Badge
              variant="outline"
              className="mb-3.5 w-max px-4 py-2 text-foreground dark:border-none dark:bg-zinc-800 dark:text-white"
            >
              FEATURE SECTION #2
            </Badge>
            <h1 className="mb-5 w-full max-w-full text-center text-[28px] font-extrabold leading-10 text-foreground dark:text-white md:w-[70%] md:max-w-[unset] md:text-[36px] md:leading-[50px] lg:w-full lg:text-left xl:text-[42px] xl:leading-[52px]">
              Advanced Platform for your Startup Web App
            </h1>
            <p className="mb-8 w-full text-center text-base font-normal leading-8 text-foreground dark:text-zinc-400 md:px-14 lg:w-[97%] lg:px-0 lg:text-left">
              Horizon UI Boilerplate comes with a premium pack that includes all
              the necessary resources to launch your startup, like the fully
              coded web app pages, landing, database, payments and so on.
            </p>
            <div className="mb-0 flex w-full flex-col items-center justify-center md:flex-row lg:mb-8 lg:justify-start">
              <Link className="me-5" href="/dashboard/main">
                <Button className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium md:mb-0">
                  Get Horizon AI Boilerplate
                </Button>
              </Link>
              <Link className="me-5" href="/dashboard/main">
                <Button
                  variant="outline"
                  className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium dark:text-white md:mb-0"
                >
                  Explore all Pages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </InnerContent>
    </div>
  );
}
