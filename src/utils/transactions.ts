import { Transaction, User } from '@/types';

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    timestamp: new Date()
  };

  const existingTransactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '[]');
  existingTransactions.push(newTransaction);
  localStorage.setItem('mpesa_transactions', JSON.stringify(existingTransactions));
  
  return newTransaction;
};

export const getUserTransactions = (userId: string): Transaction[] => {
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '[]');
  return transactions.filter((t: Transaction) => 
    t.fromUserId === userId || t.toUserId === userId
  ).sort((a: Transaction, b: Transaction) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const sendMoney = (
  fromUser: User, 
  toPhone: string, 
  amount: number
): { success: boolean; message: string; transaction?: Transaction } => {
  try {
    // Get all users to find recipient
    const allUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
    const toUser = allUsers.find((u: User) => u.phone === toPhone);
    
    if (!toUser) {
      return { success: false, message: 'Recipient not found' };
    }
    
    if (fromUser.id === toUser.id) {
      return { success: false, message: 'Cannot send money to yourself' };
    }
    
    if (fromUser.balance < amount) {
      return { success: false, message: 'Insufficient balance' };
    }
    
    if (amount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }
    
    // Update balances
    const updatedFromUser = { ...fromUser, balance: fromUser.balance - amount };
    const updatedToUser = { ...toUser, balance: toUser.balance + amount };
    
    // Update users in storage
    const userIndex = allUsers.findIndex((u: User) => u.id === fromUser.id);
    const toUserIndex = allUsers.findIndex((u: User) => u.id === toUser.id);
    
    allUsers[userIndex] = updatedFromUser;
    allUsers[toUserIndex] = updatedToUser;
    
    localStorage.setItem('mpesa_users', JSON.stringify(allUsers));
    
    // Create transaction record
    const transaction = addTransaction({
      fromUserId: fromUser.id,
      toUserId: toUser.id,
      fromPhone: fromUser.phone,
      toPhone: toUser.phone,
      amount,
      type: 'send',
      status: 'completed',
      description: `Sent to ${toUser.name}`
    });
    
    return { 
      success: true, 
      message: `Successfully sent $${amount.toFixed(2)} to ${toUser.name}`,
      transaction 
    };
    
  } catch (error) {
    console.error('Send money error:', error);
    return { success: false, message: 'Transaction failed' };
  }
};

export const depositMoney = (user: User, amount: number): { success: boolean; message: string } => {
  try {
    if (amount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }
    
    // Update user balance
    const allUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
    const userIndex = allUsers.findIndex((u: User) => u.id === user.id);
    
    if (userIndex !== -1) {
      allUsers[userIndex].balance += amount;
      localStorage.setItem('mpesa_users', JSON.stringify(allUsers));
      
      // Create transaction record
      addTransaction({
        fromUserId: 'system',
        toUserId: user.id,
        fromPhone: 'system',
        toPhone: user.phone,
        amount,
        type: 'deposit',
        status: 'completed',
        description: 'Wallet deposit'
      });
      
      return { success: true, message: `Successfully deposited $${amount.toFixed(2)}` };
    }
    
    return { success: false, message: 'User not found' };
  } catch (error) {
    console.error('Deposit error:', error);
    return { success: false, message: 'Deposit failed' };
  }
};