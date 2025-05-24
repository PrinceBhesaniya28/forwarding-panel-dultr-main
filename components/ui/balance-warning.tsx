'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { HiOutlineCurrencyDollar, HiExclamationTriangle } from 'react-icons/hi2';

interface BalanceWarningProps {
  open: boolean;
  balance: number;
  requiredBalance: number;
  postpaidLimit: number;
  onClose: () => void;
}

const BalanceWarning: React.FC<BalanceWarningProps> = ({
  open,
  balance,
  requiredBalance,
  postpaidLimit,
  onClose
}) => {
  const [countDown, setCountDown] = useState(300); // 5 minutes in seconds
  const [isPostpaid, setIsPostpaid] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Create an audio element for notification sound
    audioRef.current = new Audio('/sounds/error.mp3');
    
    // Check if in postpaid mode
    if (balance < 0) {
      setIsPostpaid(true);
    }
    
    // Play sound when dialog opens
    if (open) {
      audioRef.current.play().catch(err => console.error('Error playing notification sound:', err));
    }
    
    // Set up countdown timer
    let timer: NodeJS.Timeout | null = null;
    
    if (open && !isPostpaid) {
      timer = setInterval(() => {
        setCountDown(prev => {
          if (prev <= 1) {
            // Time's up, but we're not actually disabling the account
            if (timer) clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Cleanup
    return () => {
      if (timer) clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [open, isPostpaid, balance]);
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(countDown / 60);
    const seconds = countDown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle add funds button
  const handleAddFunds = () => {
    onClose();
    router.push('/dashboard/subscription');
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px] border-2 border-red-500">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold flex items-center text-red-600">
            <HiExclamationTriangle className="h-6 w-6 mr-2" />
            {isPostpaid 
              ? `Negative Balance Alert` 
              : `Low Balance Warning`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {isPostpaid ? (
              <>
                <p className="mb-2">
                  Your account balance is <span className="font-bold text-red-600">${balance.toFixed(2)}</span>.
                </p>
                <p className="mb-4">
                  You are currently in postpaid mode. Your account will be automatically 
                  disabled when you reach the postpaid limit of <span className="font-bold">${postpaidLimit.toFixed(2)}</span>.
                </p>
                <div className="bg-red-100 p-3 rounded-md border border-red-300 mb-2">
                  <p className="font-semibold text-red-800">
                    Please add funds immediately to avoid service interruption.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2">
                  Your account balance <span className="font-bold text-red-600">${balance.toFixed(2)}</span> is 
                  lower than the required charge rate of <span className="font-bold">${requiredBalance.toFixed(2)}</span> per minute.
                </p>
                <p className="mb-4">
                  Please add funds to your account to maintain uninterrupted service.
                </p>
                <div className="bg-yellow-100 p-3 rounded-md border border-yellow-300 mb-2">
                  <p className="font-semibold text-yellow-800">
                    This is just a warning. Your account will not be disabled.
                  </p>
                  <p className="mt-2 text-sm text-yellow-800">
                    Time remaining: {formatTimeRemaining()}
                  </p>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border-zinc-300">
            I&apos;ll Do This Later
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAddFunds}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <HiOutlineCurrencyDollar className="h-5 w-5" />
            Add Funds Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BalanceWarning; 