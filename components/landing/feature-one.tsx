'use client';

import InnerContent from '@/components/layout/innerContent';
import imagedark from '@/public/img/dark/features/feature-one.png';
import image from '@/public/img/light/features/feature-one.png';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function FeatureOne() {
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
              FEATURE SECTION #1
            </Badge>
            <h1 className="mb-5 w-full max-w-full text-center text-[28px] font-extrabold leading-10 text-foreground dark:text-white md:w-[70%] md:max-w-[unset] md:text-[36px] md:leading-[50px] lg:w-[90%] lg:text-left xl:text-[42px] xl:leading-[52px]">
              Ready to use Web App for your Startup project
            </h1>
            <p className="mb-8 w-full text-center text-base font-normal leading-8 text-foreground dark:text-zinc-400 md:w-[80%] lg:w-[100%] lg:text-left">
              It’s so easy to beat your endless procrastination when you have
              all the necessary resources to get that project done and start to
              generate your startup’s first dollar in just a few days.
            </p>
            <div className="mb-0 flex w-full flex-col items-center justify-center md:flex-row lg:mb-8 lg:justify-start">
              <Link className="me-5" href="/dashboard/main">
                <Button className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium md:mb-0">
                  Explore the Dashboard
                </Button>
              </Link>
              <Link className="me-5" href="/dashboard/main">
                <Button
                  variant="outline"
                  className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium dark:text-white md:mb-0"
                >
                  See pricing Plans
                </Button>
              </Link>
            </div>
          </div>
          <Image
            src={theme === 'dark' ? imagedark : image}
            width={1150}
            height={1150}
            alt=""
            className="mt-5 w-full md:mt-12 lg:mt-0 lg:w-[415px] xl:w-[575px]"
          />
        </div>
      </InnerContent>
    </div>
  );
}
