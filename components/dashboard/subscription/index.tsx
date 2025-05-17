/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Database } from '@/types/types_db';
import { createStripePortal } from '@/utils/stripe/server';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null | any;
  userDetails: { [x: string]: any } | null | any;
}

export default function Settings(props: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentPath = usePathname();

  const handleStripePortalRequest = async () => {
    setIsSubmitting(true);
    const redirectUrl = await createStripePortal(currentPath);
    setIsSubmitting(false);
    return router.push(redirectUrl);
  };

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
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Subscription Page"
      description="Manage your subscriptions"
    >
      <div className="flex w-full justify-center">
        {/* <div className="max-w-[1020px] w-full">
          <Card className="w-full items-center border-zinc-200 p-3 dark:border-zinc-800">
            <Card className="mb-2 w-full max-w-full border-zinc-200 bg-zinc-950 px-5 py-7 dark:border-zinc-800 dark:bg-zinc-900 md:px-10 md:py-10 lg:px-[50px] lg:py-[50px]">
              <p className="mb-2 w-max rounded-full bg-zinc-600 px-3 py-1 text-xs font-bold text-white">
                CURRENT PLAN
              </p>
              {props.subscription ? (
                props.products?.map((product: any) => {
                  const price = product?.prices?.find(
                    (price: any) => price.id === props.subscription?.price_id
                  );
                  // {props.subscription?.map((subscription:any) => {
                  //  const price = subscription?.prices?.find(
                  //   (user:any) => user.id === props?.userDetails.id,
                  //  );

                  // console.log(price);
                  if (price?.id === props.subscription.price_id)
                    return (
                      // IN CASE USER HAS PLAN
                      <div className="flex flex-col justify-between md:flex-row">
                        <div className="flex flex-col">
                          <p className="text-3xl font-extrabold text-white md:text-[44px]">
                            {product?.name
                              ? product.name?.toString()
                              : 'No plan active'}
                          </p>
                          <p className="mb-5 text-sm font-medium text-zinc-300 dark:text-zinc-400 md:mb-0 md:text-xl">
                            {product?.name
                              ? `You are currently on ${product.name?.toString()}`
                              : "You don't have an active subscription."}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <p className="mb-2.5 text-center text-lg font-extrabold text-white md:text-2xl">
                            $
                            {price?.unit_amount !== null
                              ? price?.unit_amount / 100
                              : '0'}
                            {price?.interval === 'year'
                              ? '/year'
                              : price?.interval === 'month'
                              ? '/month'
                              : 'error'}
                          </p>
                          <Button
                            className="flex h-[54px] w-full rounded-md border border-zinc-800 px-4 py-5 text-sm font-semibold text-white hover:bg-zinc-800 focus:bg-zinc-700 active:bg-zinc-700 dark:border-transparent dark:text-zinc-950 md:w-[266px]"
                            onClick={handleStripePortalRequest}
                          >
                            {props?.subscription
                              ? 'Manage your subscription'
                              : 'See pricing plans'}
                          </Button>
                        </div>
                      </div>
                    );
                })
              ) : (
                // IN CASE OF NOW PLAN
                <div className="flex flex-col justify-between md:flex-row">
                  <div className="flex flex-col">
                    <p className="mt-2 text-3xl font-extrabold text-white md:text-[44px]">
                      No plan active
                    </p>
                    <p className="py-2 text-sm font-medium text-zinc-300 dark:text-zinc-400 md:mb-0 md:mt-4 md:py-0 lg:text-xl">
                      You don't have an active subscription.
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="mb-2.5 text-left text-lg font-extrabold text-white md:text-center md:text-2xl lg:text-right">
                      $0/month
                    </p>
                    <Link href="/pricing">
                      <Button className="flex h-[54px] w-full rounded-md border border-zinc-800 px-4 py-5 text-sm font-semibold text-white hover:bg-zinc-800 focus:bg-zinc-700 active:bg-zinc-700 dark:border-transparent dark:text-foreground dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800 dark:active:bg-zinc-800 md:w-[266px]">
                        See pricing plans
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full">
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
          </Card>
        </div> */}
      </div>
    </DashboardLayout>
  );
}

// return (
//   <div className="relative bg-white dark:bg-zinc-950">
//     <div className="relative flex h-full min-h-screen flex-col items-center overflow-hidden">
//       <div className="relative flex w-full flex-col items-center justify-center pb-0 md:pb-[80px]">
//         <div className="container mx-auto px-4 py-16">
//           <div className="text-center">
//             <h1 className="text-4xl font-bold text-foreground dark:text-white md:text-5xl">
//               Simple, transparent pricing
//             </h1>
//             <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
//               Choose the plan that's right for you
//             </p>
//           </div>

//           <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//             {plans.map((plan) => (
//               <Card
//                 key={plan.name}
//                 className="flex flex-col p-6 dark:border-zinc-800"
//               >
//                 <h3 className="text-2xl font-bold text-foreground dark:text-white">
//                   {plan.name}
//                 </h3>
//                 <div className="mt-4">
//                   <span className="text-4xl font-bold text-foreground dark:text-white">
//                     {plan.price}
//                   </span>
//                   {plan.price !== 'Custom' && (
//                     <span className="text-zinc-600 dark:text-zinc-400">
//                       /month
//                     </span>
//                   )}
//                 </div>
//                 <p className="mt-2 text-zinc-600 dark:text-zinc-400">
//                   {plan.description}
//                 </p>
//                 <ul className="mt-6 space-y-4">
//                   {plan.features.map((feature) => (
//                     <li
//                       key={feature}
//                       className="flex items-center text-zinc-600 dark:text-zinc-400"
//                     >
//                       <svg
//                         className="mr-2 h-5 w-5 text-green-500"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                       {feature}
//                     </li>
//                   ))}
//                 </ul>
//                 <div className="mt-8">
//                   <Link href="/dashboard/signin/signup">
//                     <Button className="w-full">
//                       {plan.name === 'Free Plan' ? 'Get Started' : 'Subscribe'}
//                     </Button>
//                   </Link>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//       <FooterWebsite />
//     </div>
//     <NavbarFixed />
//   </div>
//   );