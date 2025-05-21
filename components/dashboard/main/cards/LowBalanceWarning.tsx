import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    audioRef.current = new Audio('/sounds/error.mp3');
    
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

  return null;
} 