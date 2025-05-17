'use client';

import Settings from '@/components/dashboard/settings';
import { Database } from '@/types/types_db';

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

export default function SettingsPage() {
  const mockData = {
    userDetails: {
      full_name: 'User',
      email: 'user@example.com',
      avatar_url: '/img/avatars/default.png'
    },
    user: {
      email: 'user@example.com',
      id: '1',
      user_metadata: {
        avatar_url: '/img/avatars/default.png',
        full_name: 'User',
        email: 'user@example.com'
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    },
    products: [] as ProductWithPrices[],
    subscription: {
      id: '1',
      user_id: '1',
      status: 'active',
      metadata: {},
      price_id: '1',
      quantity: 1,
      cancel_at_period_end: false,
      created: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date().toISOString(),
      ended_at: null,
      cancel_at: null,
      canceled_at: null,
      trial_start: null,
      trial_end: null,
      prices: {
        id: '1',
        product_id: '1',
        active: true,
        description: null,
        image: null,
        metadata: {},
        name: 'Free Plan',
        price_id: '1',
        recurring: {
          interval: 'month',
          usage_type: 'licensed'
        },
        type: 'recurring',
        unit_amount: 0,
        currency: 'USD',
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        products: {
          id: '1',
          active: true,
          name: 'Free Plan',
          description: null,
          image: null,
          metadata: {}
        }
      }
    } as unknown as SubscriptionWithProduct
  };

  return (
    <Settings
      userDetails={mockData.userDetails}
      user={mockData.user}
      products={mockData.products}
      subscription={mockData.subscription}
    />
  );
} 