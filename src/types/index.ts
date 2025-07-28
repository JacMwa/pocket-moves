export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  balance: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromPhone: string;
  toPhone: string;
  amount: number;
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  description?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, pin: string) => Promise<boolean>;
  register: (name: string, phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}