import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { depositMoney } from '@/utils/transactions';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, CreditCard, Wallet, CheckCircle } from 'lucide-react';

interface DepositMoneyProps {
  onBack: () => void;
}

const DepositMoney: React.FC<DepositMoneyProps> = ({ onBack }) => {
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

  const handleDeposit = async () => {
    if (!user) return;

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = depositMoney(user, depositAmount);
      
      if (result.success) {
        updateBalance(user.balance + depositAmount);
        setStep(2);
        toast({
          title: "Deposit successful!",
          description: result.message,
        });
      } else {
        toast({
          title: "Deposit failed",
          description: result.message,
          variant: "destructive",
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

  const handleNewDeposit = () => {
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
              <h2 className="text-2xl font-bold mb-2">Deposit Successful!</h2>
              <p className="text-muted-foreground mb-6">
                ${amount} has been added to your wallet
              </p>
              <div className="space-y-3">
                <Button onClick={handleNewDeposit} className="w-full">
                  Make Another Deposit
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
          <h1 className="text-xl font-semibold">Add Money</h1>
        </div>
        
        <Card className="bg-card/95 backdrop-blur border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Balance</span>
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
              <Wallet className="w-5 h-5" />
              Deposit Amount
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
              {[25, 50, 100, 200].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="h-12"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method (MVP - Simulated) */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Bank Account (Simulated)</p>
                  <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This is a demo version. In production, you would connect to real payment gateways.
            </p>
          </CardContent>
        </Card>

        {/* New Balance Preview */}
        {amount && parseFloat(amount) > 0 && (
          <Card className="shadow-card border-success/20 bg-success/5">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New Balance</span>
                <span className="text-2xl font-bold text-success">
                  ${((user?.balance || 0) + parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleDeposit}
          size="lg"
          className="w-full"
          disabled={!amount || parseFloat(amount) <= 0 || loading}
        >
          {loading ? 'Processing...' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add ${amount || '0.00'} to Wallet
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DepositMoney;