'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BalanceWarning from './balance-warning';

export default function BalanceTest() {
  const [showWarning, setShowWarning] = useState(false);
  const [balance, setBalance] = useState(0.5);
  const [minuteRate, setMinuteRate] = useState(0.9);
  const [postpaidLimit, setPostpaidLimit] = useState(100);

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <Card className="p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Balance Warning Test</h2>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="balance">Account Balance ($)</Label>
            <Input 
              id="balance" 
              type="number" 
              step="0.1"
              value={balance} 
              onChange={(e) => setBalance(parseFloat(e.target.value))} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="rate">Minute Rate ($)</Label>
            <Input 
              id="rate" 
              type="number" 
              step="0.1"
              value={minuteRate} 
              onChange={(e) => setMinuteRate(parseFloat(e.target.value))} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="limit">Postpaid Limit ($)</Label>
            <Input 
              id="limit" 
              type="number" 
              value={postpaidLimit} 
              onChange={(e) => setPostpaidLimit(parseFloat(e.target.value))} 
            />
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={() => setShowWarning(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Show Balance Warning
            </Button>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-2">Current Test Settings:</h3>
          <ul className="space-y-1 text-sm">
            <li><span className="font-medium">Balance:</span> ${balance.toFixed(2)}</li>
            <li><span className="font-medium">Minute Rate:</span> ${minuteRate.toFixed(2)}</li>
            <li><span className="font-medium">Postpaid Limit:</span> ${postpaidLimit.toFixed(2)}</li>
            <li>
              <span className="font-medium">Status:</span> 
              {balance < 0 
                ? (Math.abs(balance) >= postpaidLimit 
                  ? <span className="text-red-600 font-bold"> DISABLE (limit reached)</span> 
                  : <span className="text-orange-600 font-bold"> WARNING (postpaid)</span>)
                : (balance < minuteRate 
                  ? <span className="text-yellow-600 font-bold"> WARNING (low)</span> 
                  : <span className="text-green-600 font-bold"> OK</span>)
              }
            </li>
          </ul>
        </div>
      </Card>
      
      <BalanceWarning 
        open={showWarning}
        balance={balance}
        requiredBalance={minuteRate}
        postpaidLimit={postpaidLimit}
        onClose={() => setShowWarning(false)}
      />
    </div>
  );
} 