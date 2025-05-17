'use client';

import InnerContent from '@/components/layout/innerContent';
import imagedark from '@/public/img/dark/features/feature-three.png';
import image from '@/public/img/light/features/feature-three.png';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function FeatureThree() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-cover pb-[100px] pt-[100px] md:pb-[140px] md:pt-[140px]">
      <InnerContent>
        <div className="justfify-between flex max-w-[1170px] flex-col items-center gap-[50px] px-5 md:px-10 lg:flex-row lg:items-start xl:px-0">
          <div className="my-auto flex max-w-full flex-col items-center lg:items-start">
            <Badge
              variant="outline"
              className="mb-3.5 w-max px-4 py-2 text-foreground dark:border-none dark:bg-zinc-800 dark:text-white"
            >
              FEATURE SECTION #3
            </Badge>
            <h1 className="mb-5 w-full max-w-full text-center text-[26px] font-extrabold leading-10 text-foreground dark:text-white md:w-[60%] md:max-w-[unset] md:text-[36px] md:leading-[50px] lg:w-[90%] lg:text-left xl:text-[42px] xl:leading-[52px]">
              Create your SaaS without limitations
            </h1>
            <p className="mb-8 w-full text-center text-base font-normal leading-8 text-foreground dark:text-zinc-400 md:w-[74%] lg:w-[92%] lg:text-left">
              Give life to your startup project by choosing from a premium pack
              of top-notch landing sections like Hero, Features, Call to
              Actions, Pricing, Navigations, Auth pages, Dashboard, and so on.
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
          <Image
            src={theme === 'dark' ? imagedark : image}
            width={1150}
            height={575}
            alt=""
            className="mt-5 w-full md:mt-12 lg:mt-0 lg:w-[415px] xl:w-[575px]"
          />
        </div>
      </InnerContent>
    </div>
  );
}
