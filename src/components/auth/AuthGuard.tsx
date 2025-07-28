import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthFlow from './AuthFlow';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return <>{children}</>;
};

export default AuthGuard;