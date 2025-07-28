import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { sendMoney } from '@/utils/transactions';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Smartphone, DollarSign, User, CheckCircle, AlertCircle } from 'lucide-react';

interface SendMoneyProps {
  onBack: () => void;
}

const SendMoney: React.FC<SendMoneyProps> = ({ onBack }) => {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Enter details, 2: Confirm, 3: Success
  const [formData, setFormData] = useState({
    phone: '',
    amount: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState('');

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
    
    // Check if recipient exists
    if (phone.length >= 10) {
      const allUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
      const recipient = allUsers.find((u: any) => u.phone === phone);
      setRecipientName(recipient ? recipient.name : '');
    } else {
      setRecipientName('');
    }
  };

  const handleAmountChange = (amount: string) => {
    // Only allow numbers and decimal point
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    setFormData(prev => ({ ...prev, amount: cleanAmount }));
  };

  const handleContinue = () => {
    if (!formData.phone || !formData.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!recipientName) {
      toast({
        title: "Recipient not found",
        description: "No M-Pesa account found with this phone number.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > (user?.balance || 0)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds for this transaction.",
        variant: "destructive",
      });
      return;
    }

    setStep(2);
  };

  const handleSend = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = sendMoney(user, formData.phone, parseFloat(formData.amount));
      
      if (result.success) {
        updateBalance(user.balance - parseFloat(formData.amount));
        setStep(3);
        toast({
          title: "Money sent successfully!",
          description: result.message,
        });
      } else {
        toast({
          title: "Transaction failed",
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

  const handleNewTransaction = () => {
    setFormData({ phone: '', amount: '', note: '' });
    setRecipientName('');
    setStep(1);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card className="shadow-float border-0 text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Transaction Successful!</h2>
              <p className="text-muted-foreground mb-6">
                You sent ${formData.amount} to {recipientName}
              </p>
              <div className="space-y-3">
                <Button onClick={handleNewTransaction} className="w-full">
                  Send Another
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
            onClick={step === 2 ? () => setStep(1) : onBack}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">
            {step === 1 ? 'Send Money' : 'Confirm Transaction'}
          </h1>
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

      <div className="p-6">
        {step === 1 ? (
          <div className="space-y-6">
            {/* Recipient */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Recipient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+254701234567"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="h-12"
                  />
                  {recipientName && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span>{recipientName}</span>
                    </div>
                  )}
                  {formData.phone.length >= 10 && !recipientName && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>Recipient not found</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amount */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="h-16 text-2xl text-center font-bold"
                  />
                </div>
                
                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="h-10"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Note (Optional) */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <Input
                  placeholder="Add a note (optional)"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  className="h-12"
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full"
              disabled={!formData.phone || !formData.amount || !recipientName}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Confirmation Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <div className="text-right">
                    <div className="font-medium">{recipientName}</div>
                    <div className="text-sm text-muted-foreground">{formData.phone}</div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold">${formData.amount}</span>
                </div>

                {formData.note && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note</span>
                    <span>{formData.note}</span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>New Balance</span>
                    <span>${((user?.balance || 0) - parseFloat(formData.amount)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleSend}
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send ${formData.amount}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
                disabled={loading}
              >
                Back to Edit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoney;