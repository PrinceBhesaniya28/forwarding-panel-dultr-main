import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HiExclamationTriangle } from 'react-icons/hi2';

interface Props {
  currentBalance: number;
  requiredBalance: number;
  onAddFunds: () => void;
}

export default function LowBalanceWarning({ currentBalance, requiredBalance, onAddFunds }: Props) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for warning sound
    audioRef.current = new Audio('/sounds/notification.mp3');
    
    // Play sound when component mounts
    if (audioRef.current) {
      // Set volume to 50%
      audioRef.current.volume = 0.5;
      
      // Play sound
      const playSound = async () => {
        try {
          await audioRef.current?.play();
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      };
      
      playSound();
    }

    // Show toast notification
    toast({
      title: "⚠️ Low Balance Warning",
      description: `Your account balance ($${currentBalance.toFixed(2)}) is below the required amount ($${requiredBalance.toFixed(2)}). Please add funds to continue making calls.`,
      duration: 5000,
      variant: "destructive"
    });

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentBalance, requiredBalance, toast]);

  return (
    <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HiExclamationTriangle className="h-6 w-6 text-yellow-500" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Low Balance Warning
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Current Balance: ${currentBalance.toFixed(2)} | Required: ${requiredBalance.toFixed(2)}
            </p>
          </div>
        </div>
        <Button
          onClick={onAddFunds}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Add Funds
        </Button>
      </div>
    </Card>
  );
} 