'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { setAuthToken, setUserData } from '@/utils/auth';

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod
}: PasswordSignInProps) {
  const router = useRouter();
  const { toast } = useToast();
  const shouldUseRouter = redirectMethod === 'client';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearExistingAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    console.log('🔑 Attempting to sign in with email:', email);
    
    try {
      const response = await fetch('/api/users/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      let data;
      try {
        data = await response.json();
        console.log('🔄 Sign-in response body:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        
        try {
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          console.log('🔄 Sign-in response text:', text.substring(0, 500) + '...');
        } catch (textError) {
          console.error('❌ Failed to read response text:', textError);
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid response from server. Please try again later.",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (response.ok) {
        console.log('✅ Sign-in successful, redirecting to dashboard');
        
        // Clear existing auth data before setting new data
        clearExistingAuthData();
        
        // Store auth token and user data in localStorage
        if (data.token) {
          setAuthToken(data.token);
          // Set the auth token in cookies
          document.cookie = `authToken=${data.token}; path=/; max-age=86400; secure; samesite=strict`;
          console.log('🔑 Auth Token set:', data.token);
        } else if (data.data?.token) {
          setAuthToken(data.data.token);
          // Set the auth token in cookies
          document.cookie = `authToken=${data.data.token}; path=/; max-age=86400; secure; samesite=strict`;
          console.log('🔑 Auth Token set from data:', data.data.token);
        }
        
        // Store user data if available
        if (data.data) {
          const userData = data.data.rsp || data.data;
          
          // Store complete user data including additional fields
          const completeUserData = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: userData.createdAt,
            balance: userData.balance,
            trunk: userData.trunk,
            subscription: userData.subscription,
            status: userData.status
          };
          
          // Store directly in localStorage
          localStorage.setItem('userData', JSON.stringify(completeUserData));
          console.log('📊 Stored User Data:', completeUserData);
          
          // Also store using the utility function
          setUserData(completeUserData);
          
          if (userData?.role) {
            localStorage.setItem('userRole', userData.role);
            console.log('👤 User Role set:', userData.role);
          }
        }
        
        toast({
          title: "Success",
          description: "Sign in successful! Redirecting...",
        });
        
        // Redirect on success
        setTimeout(() => {
          if (shouldUseRouter) {
            router.push('/dashboard');
            router.refresh(); // Force a refresh to ensure new auth state is picked up
          } else {
            window.location.href = '/dashboard';
          }
        }, 1000);
      } else {
        console.error('❌ Sign-in failed:', data.message);
        
        toast({
          variant: "destructive",
          title: "Sign-in Failed",
          description: data.message || "Invalid email or password",
        });
      }
    } catch (error) {
      console.error('❌ Exception during sign in:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form
        noValidate={true}
        className="mb-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <label className="text-foreground" htmlFor="email">
              Email
            </label>
            <Input
              className="mr-2.5 mb-2 h-full min-h-[44px] w-full px-4 py-3 focus:outline-0 dark:placeholder:text-zinc-400"
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
            />
            <label
              className="text-foreground mt-2 dark:text-white"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              className="mr-2.5 mb-2 h-full min-h-[44px] w-full px-4 py-3 focus:outline-0 dark:placeholder:text-zinc-400"
            />
          </div>
          <Button
            type="submit"
            className="mt-2 flex h-[unset] w-full items-center justify-center rounded-lg px-4 py-4 text-sm font-medium"
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
              'Sign in'
            )}
          </Button>
        </div>
      </form>
      <p>
        <Link
          href="/dashboard/signin/password_signin"
          className="font-medium text-foreground dark:text-white text-sm"
        >
          Forgot your password?
        </Link>
      </p>
      {/* {allowEmail && (
        <p>
          <Link
            href="/dashboard/signin/email_signin"
            className="font-medium text-foreground dark:text-white text-sm"
          >
            Sign in via magic link
          </Link>
        </p>
      )} */}
      <p>
        <Link
          href="/dashboard/signin/password_signin"
          className="font-medium text-foreground dark:text-white text-sm"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </p>
    </div>
  );
}
