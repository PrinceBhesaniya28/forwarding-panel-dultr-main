/*eslint-disable*/
'use client';

// import ManageSubscriptionButton from './ManageSubscriptionButton';
import DashboardLayout from '@/components/layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Database } from '@/types/types_db';
import { handleRequest } from '@/utils/auth-helpers/client';
import { updateEmail, updateName } from '@/utils/auth-helpers/server';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HiOutlineCheck } from 'react-icons/hi';
import { HiOutlineBellAlert } from 'react-icons/hi2';
import Notification from './components/notification';
import { getUserRole, getUserData, getAuthToken } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';

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
  subscription: SubscriptionWithProduct | null;
  userDetails: { [x: string]: any } | null;
}

export default function Settings(props: Props) {
  // Input States
  const [nameError, setNameError] = useState<{
    status: boolean;
    message: string;
  }>();

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userRole = getUserRole();
  const [userData, setUserData] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check direct localStorage first (existing logic)
    const storedData = localStorage.getItem('userData');
    console.log('Direct localStorage data:', storedData);

    // Also check utility function storage
    const utilityData = getUserData();
    console.log('Utility function data:', utilityData);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        console.log('Using data from localStorage:', parsedData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new email is the same as the old email
    if (e.currentTarget.newEmail.value === props.user.email) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    handleRequest(e, updateEmail, router);
    setIsSubmitting(false);
  };

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new name is the same as the old name
    if (e.currentTarget.fullName.value === props.user.user_metadata.full_name) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    handleRequest(e, updateName, router);
    setIsSubmitting(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch('https://dialo.dollu.com/rest/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: userData?.id,
          password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password updated successfully'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to update password'
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const notifications = [
    { message: 'Your call has been confirmed.', time: '1 hour ago' },
    { message: 'You have a new message!', time: '1 hour ago' },
    { message: 'Your subscription is expiring soon!', time: '2 hours ago' }
  ];

  return (
    <DashboardLayout
      userDetails={props.userDetails}
      user={props.user}
      products={props.products}
      subscription={props.subscription}
      title="Account Settings"
      description="Profile settings."
    >
      <div className="relative mx-auto flex w-max max-w-full flex-col md:pt-[unset] lg:pt-[100px] lg:pb-[100px]">
        <div className="maw-w-full mx-auto w-full flex-col justify-center md:w-full md:flex-row xl:w-full">
          <Card
            className={
              'mb-5 h-min flex items-center aligh-center max-w-full py-8 px-4 dark:border-zinc-800'
            }
          >
            <Avatar className="min-h-[68px] min-w-[68px]">
              <AvatarImage src={props.user?.user_metadata.avatar_url} />
              <AvatarFallback className="text-2xl font-bold dark:text-zinc-950">
                {props.user?.user_metadata.full_name
                  ? `${props.user.user_metadata.full_name[0]}`
                  : `${props.user?.email?.[0].toUpperCase()}`}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="text-xl font-extrabold text-foreground leading-[100%] dark:text-white md:text-3xl">
                {userData?.name}
              </p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-2 md:text-base">
                {userData?.email}
              </p>
            </div>
          </Card>
          <Card
            className={
              'mb-5 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800'
            }
          >
            <p className="text-xl font-extrabold text-foreground dark:text-white md:text-3xl">
              Account Details
            </p>
            <p className="mb-6 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
              Here you can view your account information
            </p>
            <div className="mb-8 space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Trunk
                </span>
                <span className="text-foreground dark:text-white">
                  {userData?.trunk}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Status
                </span>
                <span className="text-foreground dark:text-white">
                  {userData?.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            {/* <label
              className="mb-3 flex cursor-pointer px-2.5 font-bold leading-none text-foreground dark:text-white"
              htmlFor={'name'}
            >
              Your Name
              <p className="ml-1 mt-[1px] text-sm font-medium leading-none text-zinc-500 dark:text-zinc-400">
                (30 characters maximum)
              </p>
            </label>
            <div className="mb-8 flex flex-col md:flex-row">
              <form
                className="w-full"
                id="nameForm"
                onSubmit={(e) => handleSubmitName(e)}
              >
                <Input
                  type="text"
                  name="fullName"
                  defaultValue={props.user?.user_metadata.full_name ?? ''}
                  placeholder="Please enter your full name"
                  className={`mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0`}
                />
              </form>
              <Button
                className="flex h-full max-h-full w-full items-center justify-center rounded-md px-4 py-4 text-base font-medium md:ms-4 md:w-[300px]"
                form="nameForm"
                type="submit"
              >
                Update name
              </Button>
              <div className="mt-8 h-px w-full max-w-[90%] self-center bg-zinc-200 dark:bg-white/10 md:mt-0 md:hidden" />
            </div> */}
            <p
              className={`mb-5 px-2.5 text-red-500 md:px-9 ${
                nameError?.status ? 'block' : 'hidden'
              }`}
            >
              {nameError?.message}
            </p>
            <form onSubmit={handlePasswordUpdate}>
              <label
                className="mb-3 flex cursor-pointer px-2.5 font-bold leading-none text-foreground dark:text-white"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <div className="mb-4">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  className="mr-4 flex h-full max-w-full w-full items-center justify-center px-4 py-4 outline-none"
                  required
                  minLength={6}
                />
              </div>
              <label
                className="mb-3 flex cursor-pointer px-2.5 font-bold leading-none text-foreground dark:text-white"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="mb-8 flex flex-col md:flex-row">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="mr-4 flex h-full max-w-full w-full items-center justify-center px-4 py-4 outline-none"
                  required
                  minLength={6}
                />
                <Button
                  type="submit"
                  className="flex h-full max-h-full w-full items-center justify-center rounded-md px-4 py-4 text-base font-medium md:ms-4 md:w-[300px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="mr-2 inline h-4 w-4 animate-spin text-zinc-200 duration-500 dark:text-zinc-950"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="white"
                      ></path>
                    </svg>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
              <div className="mt-8 h-px w-full max-w-[90%] self-center bg-zinc-200 dark:bg-white/10 md:mt-0 md:hidden" />
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
