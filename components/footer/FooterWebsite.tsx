/*eslint-disable*/
'use client';

import Link from 'next/link';
import React from 'react';
import { HiBolt } from 'react-icons/hi2';

export function FooterWebsite() {
  return (
    <div className="relative z-[3] flex flex-col items-center justify-between px-5 pb-[50px] xl:px-0">
      <div className="flex h-[1px] w-full max-w-[1170px] bg-zinc-200 dark:bg-zinc-800" />
      <div className="mx-auto mt-20 flex w-full max-w-full flex-col justify-between md:mt-12 lg:flex-row xl:w-[1170px] xl:max-w-[1170px]">
        <div className="my-auto mb-5 max-w-full lg:mb-0 lg:w-[21%] xl:max-w-max xl:pl-0">
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
        </div>
        <div className="flex w-full flex-col items-center justify-center text-center md:flex-row xl:w-[unset]">
          <div className="mx-auto mb-5 mt-5 flex flex-col items-center justify-center lg:mb-[unset] lg:mr-0 lg:items-end lg:justify-end">
            <div className="my-auto flex flex-col md:flex-row">
              <a
                target="_blank"
                className="mb-5 mr-0 text-sm font-medium text-foreground dark:text-white md:mb-0 md:mr-10"
                href="/pricing"
              >
                Pricing
              </a>
              <a
                target="_blank"
                href="mailto:hello@horizon-ui.com"
                className="mb-5 mr-0 text-sm font-medium text-foreground dark:text-white md:mb-0 md:mr-10"
              >
                Account
              </a>
              <a
                target="_blank"
                href="https://horizon-ui.notion.site/Refund-Policy-1b0983287b92486cb6b18071b2343ac9"
                className="mb-5 mr-0 text-sm font-medium text-foreground dark:text-white md:mb-0 md:mr-10"
              >
                Refund Policy
              </a>
              <a
                target="_blank"
                href="https://horizon-ui.notion.site/Privacy-Policy-c22ff04f55474ae3b35ec45feca62bad"
                className="mb-5 mr-0 text-sm font-medium text-foreground dark:text-white md:mb-0 md:mr-10"
              >
                Privacy Policy
              </a>
              <a
                target="_blank"
                href="https://horizon-ui.notion.site/Terms-Conditions-c671e573673746e19d2fc3e4cba0c161"
                className="text-sm font-medium text-foreground dark:text-zinc-400"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-[1170px] px-2.5 md:px-[100px]">
        <p className="mb-10 mt-10 text-center text-sm font-normal leading-[180%] text-foreground dark:text-zinc-400">
          <span className="font-medium">Use it with caution:</span> This tool
          can be helpful, but it is not a substitute for your own knowledge and
          understanding. Make sure to use it as a supplement to your own
          research and writing, rather than relying on it exclusively (you can
          use this on your AI startup website).
        </p>
      </div>
    </div>
  );
}
