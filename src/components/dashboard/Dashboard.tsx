import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTransactions } from '@/utils/transactions';
import { Transaction } from '@/types';
import { 
  Wallet, 
  Send, 
  Plus, 
  Minus, 
  History, 
  Eye, 
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Check,
  X,
  LogOut
} from 'lucide-react';

interface DashboardProps {
  onSendMoney: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSendMoney, onDeposit, onWithdraw }) => {
  const { user, logout, updateBalance } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const userTransactions = getUserTransactions(user.id);
      setTransactions(userTransactions.slice(0, 5)); // Show last 5 transactions
      
      // Update balance from storage in case it changed
      const allUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
      const currentUser = allUsers.find((u: any) => u.id === user.id);
      if (currentUser && currentUser.balance !== user.balance) {
        updateBalance(currentUser.balance);
      }
    }
  }, [user, updateBalance]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'send' && transaction.fromUserId === user?.id) {
      return <ArrowUpRight className="w-4 h-4 text-destructive" />;
    }
    if (transaction.type === 'send' && transaction.toUserId === user?.id) {
      return <ArrowDownLeft className="w-4 h-4 text-success" />;
    }
    if (transaction.type === 'deposit') {
      return <Plus className="w-4 h-4 text-success" />;
    }
    return <Minus className="w-4 h-4 text-destructive" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3 text-success" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-warning" />;
      case 'failed':
        return <X className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.type === 'send' && transaction.fromUserId === user?.id) {
      return `Sent to ${transaction.toPhone}`;
    }
    if (transaction.type === 'send' && transaction.toUserId === user?.id) {
      return `Received from ${transaction.fromPhone}`;
    }
    return transaction.description || 'Transaction';
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isDebit = transaction.type === 'send' && transaction.fromUserId === user?.id || 
                   transaction.type === 'withdraw';
    return isDebit ? -transaction.amount : transaction.amount;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-primary-foreground/80">{user?.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="bg-card/95 backdrop-blur border-0 shadow-float">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="font-medium text-card-foreground">Current Balance</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 w-8"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-3xl font-bold text-card-foreground mb-4">
              {showBalance ? formatCurrency(user?.balance || 0) : '••••••'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={onSendMoney}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeposit}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onWithdraw}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={onSendMoney}
          >
            <Send className="w-6 h-6" />
            <span className="text-xs">Send</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={onDeposit}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Deposit</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={onWithdraw}
          >
            <Minus className="w-6 h-6" />
            <span className="text-xs">Withdraw</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
          >
            <History className="w-6 h-6" />
            <span className="text-xs">History</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Start by sending money or making a deposit</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-background">
                        {getTransactionIcon(transaction)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {getTransactionDescription(transaction)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className={`font-semibold ${
                          getTransactionAmount(transaction) >= 0 
                            ? 'text-success' 
                            : 'text-destructive'
                        }`}>
                          {getTransactionAmount(transaction) >= 0 ? '+' : ''}
                          {formatCurrency(Math.abs(getTransactionAmount(transaction)))}
                        </span>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;