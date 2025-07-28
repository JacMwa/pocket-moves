import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Lock, User, ArrowRight } from 'lucide-react';

const AuthFlow: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin: '',
    confirmPin: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(formData.phone, formData.pin);
        if (success) {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in to your M-Pesa account.",
          });
        } else {
          toast({
            title: "Login failed",
            description: "Invalid phone number or PIN.",
            variant: "destructive",
          });
        }
      } else {
        if (formData.pin !== formData.confirmPin) {
          toast({
            title: "PIN mismatch",
            description: "Please ensure both PINs match.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        const success = await register(formData.name, formData.phone, formData.pin);
        if (success) {
          toast({
            title: "Account created!",
            description: "Welcome to M-Pesa! Your account is ready.",
          });
        } else {
          toast({
            title: "Registration failed",
            description: "Phone number already exists.",
            variant: "destructive",
          });
        }
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="bg-card rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-float mb-4">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">M-Pesa</h1>
          <p className="text-primary-foreground/80">Your trusted mobile money partner</p>
        </div>

        <Card className="shadow-float border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Enter your details to access your wallet' 
                : 'Join millions using M-Pesa for secure money transfers'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required={!isLogin}
                    className="h-12"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+254701234567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  4-Digit PIN
                </label>
                <Input
                  type="password"
                  placeholder="Enter your PIN"
                  value={formData.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value)}
                  maxLength={4}
                  required
                  className="h-12"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm PIN
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm your PIN"
                    value={formData.confirmPin}
                    onChange={(e) => handleInputChange('confirmPin', e.target.value)}
                    maxLength={4}
                    required
                    className="h-12"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-primary-foreground/60 text-xs">
            Secure • Fast • Trusted by millions
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;