import Main from '@/components/dashboard/main';

export default function Account() {
  // Enhanced mock data with email in user_metadata
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
        email: 'user@example.com'  // Added email to user_metadata
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    },
    products: [],
    subscription: {
      status: 'active',
      price: {
        unit_amount: 0,
        currency: 'USD',
        interval: 'month',
        product: {
          name: 'Free Plan'
        }
      }
    }
  };

  return (
    <Main
      userDetails={mockData.userDetails}
      user={mockData.user}
      products={mockData.products}
      subscription={mockData.subscription}
    />
  );
}
