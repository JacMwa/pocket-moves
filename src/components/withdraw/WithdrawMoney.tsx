import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { addTransaction } from '@/utils/transactions';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Minus, Building, CheckCircle, AlertCircle } from 'lucide-react';

interface WithdrawMoneyProps {
  onBack: () => void;
}

const WithdrawMoney: React.FC<WithdrawMoneyProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter amount, 2: Success

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleanAmount = value.replace(/[^0-9.]/g, '');
    setAmount(cleanAmount);
  };

  const handleWithdraw = async () => {
    if (!user) return;

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > user.balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update user balance
      const allUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        allUsers[userIndex].balance -= withdrawAmount;
        localStorage.setItem('mpesa_users', JSON.stringify(allUsers));
        updateBalance(user.balance - withdrawAmount);
        
        // Create transaction record
        addTransaction({
          fromUserId: user.id,
          toUserId: 'system',
          fromPhone: user.phone,
          toPhone: 'system',
          amount: withdrawAmount,
          type: 'withdraw',
          status: 'completed',
          description: 'Cash withdrawal'
        });
        
        setStep(2);
        toast({
          title: "Withdrawal successful!",
          description: `$${withdrawAmount.toFixed(2)} withdrawn from your wallet`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewWithdrawal = () => {
    setAmount('');
    setStep(1);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card className="shadow-float border-0 text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Withdrawal Successful!</h2>
              <p className="text-muted-foreground mb-6">
                ${amount} has been withdrawn from your wallet
              </p>
              <div className="space-y-3">
                <Button onClick={handleNewWithdrawal} className="w-full">
                  Make Another Withdrawal
                </Button>
                <Button variant="outline" onClick={onBack} className="w-full">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Withdraw Money</h1>
        </div>
        
        <Card className="bg-card/95 backdrop-blur border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="text-2xl font-bold">${user?.balance?.toFixed(2) || '0.00'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 space-y-6">
        {/* Amount Input */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Minus className="w-5 h-5" />
              Withdrawal Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-16 text-3xl text-center font-bold"
              />
            </div>
            
            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="h-12"
                  disabled={quickAmount > (user?.balance || 0)}
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>

            {/* Balance Warning */}
            {amount && parseFloat(amount) > (user?.balance || 0) && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Amount exceeds available balance</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal Method (MVP - Simulated) */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5" />
              Withdrawal Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Bank Account (Simulated)</p>
                  <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This is a demo version. In production, you would connect to real banking systems or agent networks.
            </p>
          </CardContent>
        </Card>

        {/* New Balance Preview */}
        {amount && parseFloat(amount) > 0 && parseFloat(amount) <= (user?.balance || 0) && (
          <Card className="shadow-card border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New Balance</span>
                <span className="text-2xl font-bold text-warning">
                  ${((user?.balance || 0) - parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleWithdraw}
          size="lg"
          className="w-full"
          disabled={
            !amount || 
            parseFloat(amount) <= 0 || 
            parseFloat(amount) > (user?.balance || 0) || 
            loading
          }
        >
          {loading ? 'Processing...' : (
            <>
              <Minus className="w-4 h-4 mr-2" />
              Withdraw ${amount || '0.00'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WithdrawMoney;