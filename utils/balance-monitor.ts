import { toast } from '@/hooks/use-toast';

const POSTPAID_LIMIT = 100; // $100 postpaid limit
const WARNING_THRESHOLD = 0.1; // 10% of required balance
const DISABLE_WARNING_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface BalanceCheck {
  currentBalance: number;
  requiredBalance: number;
  isPostpaid: boolean;
  shouldShowWarning: boolean;
}

let disableTimeout: NodeJS.Timeout | null = null;

export function checkBalance(currentBalance: number, requiredBalance: number): BalanceCheck {
  const isPostpaid = currentBalance < 0;
  const isBelowRequired = currentBalance < requiredBalance;
  const isNearPostpaidLimit = isPostpaid && Math.abs(currentBalance) >= POSTPAID_LIMIT;
  const shouldShowWarning = currentBalance < (requiredBalance * WARNING_THRESHOLD);

  // Clear any existing disable timeout
  if (disableTimeout) {
    clearTimeout(disableTimeout);
    disableTimeout = null;
  }

  // If balance is negative and exceeds postpaid limit
  if (isNearPostpaidLimit) {
    // Show warning and set timeout for disabling
    showDisableWarning(currentBalance);
    
    // Set timeout to disable account after 5 minutes
    disableTimeout = setTimeout(() => {
      disableUserAccount();
    }, DISABLE_WARNING_TIME);

    return {
      currentBalance,
      requiredBalance,
      isPostpaid: true,
      shouldShowWarning: true
    };
  }

  // If balance is below required amount
  if (isBelowRequired) {
    // Show warning if balance is below threshold
    if (shouldShowWarning) {
      showLowBalanceWarning(currentBalance, requiredBalance);
    }
  }

  return {
    currentBalance,
    requiredBalance,
    isPostpaid,
    shouldShowWarning
  };
}

function showLowBalanceWarning(currentBalance: number, requiredBalance: number) {
  toast({
    title: "Low Balance Warning",
    description: `Your account balance ($${currentBalance.toFixed(2)}) is below the required amount ($${requiredBalance.toFixed(2)}). Please add funds to continue making calls.`,
    duration: 5000,
    variant: "destructive"
  });
}

function showDisableWarning(currentBalance: number) {
  toast({
    title: "⚠️ Account Disable Warning",
    description: `Your account balance ($${currentBalance.toFixed(2)}) has exceeded the postpaid limit of $${POSTPAID_LIMIT}. Your account will be disabled in 5 minutes unless you add funds.`,
    duration: 5000,
    variant: "destructive"
  });
}

async function disableUserAccount() {
  try {
    const response = await fetch('/api/user/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to disable user account');
    }

    toast({
      title: "Account Disabled",
      description: "Your account has been disabled due to exceeding the postpaid limit. Please add funds to reactivate.",
      variant: "destructive",
    });
  } catch (error) {
    console.error('Error disabling user account:', error);
  }
}

export function calculateRequiredBalance(callRate: number, estimatedDuration: number): number {
  // Calculate required balance based on call rate and estimated duration
  return callRate * (estimatedDuration / 60); // Convert minutes to hours
} 