import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Shield } from 'lucide-react';

export const LoginForm = () => {
  const { login, mockUsers } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [selectedQuickUser, setSelectedQuickUser] = useState('');

  const handleLogin = () => {
    const userEmail = email || selectedQuickUser;
    if (!userEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email or select a quick login option.",
        variant: "destructive"
      });
      return;
    }

    const user = login(userEmail);
    if (user) {
      toast({
        title: "Login Successful",
        description: `Welcome ${user.name}! Role: ${user.role}`
      });
    } else {
      toast({
        title: "Login Failed",
        description: "User not found in SharePoint directory.",
        variant: "destructive"
      });
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    const user = login(userEmail);
    if (user) {
      toast({
        title: "Login Successful",
        description: `Welcome ${user.name}! Role: ${user.role}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold">YSOD Digital Acknowledgment</h1>
          <p className="text-muted-foreground">Sign in to access the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or quick demo login</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Login (Demo)</Label>
              <Select value={selectedQuickUser} onValueChange={setSelectedQuickUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select demo user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amer.alsomali@domain.com">
                    Admin - Amer Al Somali
                  </SelectItem>
                  <SelectItem value="supervisorA@domain.com">
                    Supervisor A - Unit A
                  </SelectItem>
                  <SelectItem value="supervisorB@domain.com">
                    Supervisor B - Unit B
                  </SelectItem>
                  <SelectItem value="ahmed.khaled@domain.com">
                    Employee - Ahmed Khaled
                  </SelectItem>
                  <SelectItem value="reem.abdullah@domain.com">
                    Employee - Reem Abdullah
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {selectedQuickUser && (
                <Button 
                  variant="outline" 
                  onClick={() => handleQuickLogin(selectedQuickUser)}
                  className="w-full"
                >
                  Login as {selectedQuickUser.split('@')[0]}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Demo Roles Available:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Admin:</strong> Full system access, manage all acknowledgments</li>
              <li>• <strong>Supervisor:</strong> View team submissions, filtered dashboard</li>
              <li>• <strong>Employee:</strong> Submit and view own acknowledgments</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};