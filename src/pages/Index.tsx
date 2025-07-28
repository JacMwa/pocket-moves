import React, { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Dashboard from '@/components/dashboard/Dashboard';
import SendMoney from '@/components/send/SendMoney';
import DepositMoney from '@/components/deposit/DepositMoney';
import WithdrawMoney from '@/components/withdraw/WithdrawMoney';

type ViewType = 'dashboard' | 'send' | 'deposit' | 'withdraw';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'send':
        return <SendMoney onBack={() => setCurrentView('dashboard')} />;
      case 'deposit':
        return <DepositMoney onBack={() => setCurrentView('dashboard')} />;
      case 'withdraw':
        return <WithdrawMoney onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <Dashboard
            onSendMoney={() => setCurrentView('send')}
            onDeposit={() => setCurrentView('deposit')}
            onWithdraw={() => setCurrentView('withdraw')}
          />
        );
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {renderView()}
      </div>
    </AuthGuard>
  );
};

export default Index;
