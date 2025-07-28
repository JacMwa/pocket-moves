import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('mpesa_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (name: string, phone: string, pin: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
      const userExists = existingUsers.find((u: User) => u.phone === phone);
      
      if (userExists) {
        return false; // User already exists
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        phone,
        pin,
        balance: 0,
        createdAt: new Date()
      };

      // Store user in users list
      existingUsers.push(newUser);
      localStorage.setItem('mpesa_users', JSON.stringify(existingUsers));
      
      // Set as current user
      setUser(newUser);
      localStorage.setItem('mpesa_user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (phone: string, pin: string): Promise<boolean> => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
      const foundUser = existingUsers.find((u: User) => u.phone === phone && u.pin === pin);
      
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('mpesa_user', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mpesa_user');
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('mpesa_user', JSON.stringify(updatedUser));
      
      // Update in users list too
      const existingUsers = JSON.parse(localStorage.getItem('mpesa_users') || '[]');
      const userIndex = existingUsers.findIndex((u: User) => u.id === user.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = updatedUser;
        localStorage.setItem('mpesa_users', JSON.stringify(existingUsers));
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};