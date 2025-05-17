import type { Tables } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { createContext } from 'react';

interface PlanContextType {
  plan: {
    product: string;
    price: string;
  };
  setPlan: React.Dispatch<
    React.SetStateAction<{
      product: string;
      price: string;
    }>
  >;
}

interface OpenContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;

interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}
type UserDetails = { [x: string]: any } | null;

export const PlanContext = createContext<PlanContextType>(undefined);
export const OpenContext = createContext<OpenContextType>(undefined);
export const ProductsContext = createContext<ProductWithPrices[] | undefined>(
  undefined
);
export const SubscriptionContext = createContext<SubscriptionWithProduct | null>(
  undefined
);
export const UserContext = createContext<User | undefined | null>(undefined);
export const UserDetailsContext = createContext<UserDetails | undefined | null>(
  undefined
);
