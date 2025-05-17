'use client';

import { FooterWebsite } from '@/components/footer/FooterWebsite';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import NavbarFixed from '@/components/navbar/NavbarFixed';

export default function PricingPage() {
  const { theme } = useTheme();

  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      description: 'Perfect for testing the waters',
      features: [
        '1 user',
        'Basic features',
        'Community support',
        'Limited storage'
      ]
    },
    {
      name: 'Pro Plan',
      price: '$9.99',
      description: 'Best for professional creators',
      features: [
        '5 users',
        'All Free features',
        'Priority support',
        'Advanced analytics',
        'Unlimited storage'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large scale applications',
      features: [
        'Unlimited users',
        'All Pro features',
        '24/7 support',
        'Custom integrations',
        'Dedicated account manager'
      ]
    }
  ];

  return (
    <div className="relative bg-white dark:bg-zinc-950">
      <div className="relative flex h-full min-h-screen flex-col items-center overflow-hidden">
        <div className="relative flex w-full flex-col items-center justify-center pb-0 md:pb-[80px]">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground dark:text-white md:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Choose the plan that&apos;s right for you
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className="flex flex-col p-6 dark:border-zinc-800"
                >
                  <h3 className="text-2xl font-bold text-foreground dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground dark:text-white">
                      {plan.price}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-zinc-600 dark:text-zinc-400">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-zinc-600 dark:text-zinc-400"
                      >
                        <svg
                          className="mr-2 h-5 w-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href="/dashboard/signin/signup">
                      <Button className="w-full">
                        {plan.name === 'Free Plan' ? 'Get Started' : 'Subscribe'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <FooterWebsite />
      </div>
      <NavbarFixed />
    </div>
  );
} 