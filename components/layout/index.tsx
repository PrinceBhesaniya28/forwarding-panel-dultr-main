import Footer from '@/components/footer/FooterAdmin';
import Navbar from '@/components/navbar/NavbarAdmin';
import { routes } from '@/components/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import { Database } from '@/types/types_db';
import { getActiveRoute } from '@/utils/navigation';
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import {
  OpenContext,
  PlanContext,
  ProductsContext,
  SubscriptionContext,
  UserContext,
  UserDetailsContext
} from '@/contexts/layout';

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
  children: React.ReactNode;
  title: string;
  description: string;
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
  userDetails: { [x: string]: any } | null;
}

const DashboardLayout: React.FC<Props> = (props: Props) => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [plan, setPlan] = useState({
    product: 'prod_QfhYC6AAtI5IKW',
    price: 'price_1PoM9GDWNoHJSR0zmwpicH8y'
  });

  return (
    <UserContext.Provider value={props.user}>
      <UserDetailsContext.Provider value={props.userDetails}>
        <OpenContext.Provider value={{ open, setOpen }}>
          <PlanContext.Provider value={{ plan, setPlan }}>
            <ProductsContext.Provider value={props.products}>
              <SubscriptionContext.Provider value={props.subscription}>
                <div className="dark:bg-bg-900 flex h-full w-full bg-bg-100">
                  <Sidebar routes={routes} setOpen={setOpen} />
                  <div className="h-full w-full dark:bg-zinc-950">
                    <main
                      className={`mx-2.5 flex-none transition-all dark:bg-zinc-950 md:pr-2 xl:ml-[328px]`}
                    >
                      <div className="mx-auto min-h-screen p-2 !pt-[90px] md:p-2 md:!pt-[118px]">
                        {props.children}
                      </div>
                      <Navbar brandText={getActiveRoute(routes, pathname)} />
                      <div className="p-3">
                        <Footer />
                      </div>
                    </main>
                  </div>
                </div>
              </SubscriptionContext.Provider>
            </ProductsContext.Provider>
          </PlanContext.Provider>
        </OpenContext.Provider>
      </UserDetailsContext.Provider>
    </UserContext.Provider>
  );
};

export default DashboardLayout;
