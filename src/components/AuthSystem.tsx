import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Shield } from 'lucide-react';

export interface UserData {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthSystemProps {
  onLogin: (user: UserData) => void;
}

// Mock users for demonstration
const mockUsers: UserData[] = [
  { id: '1', username: 'admin', role: 'admin', name: 'System Administrator' },
  { id: '2', username: 'user1', role: 'user', name: 'John Smith' },
  { id: '3', username: 'user2', role: 'user', name: 'Sarah Johnson' },
  { id: '4', username: 'manager', role: 'admin', name: 'Mike Wilson' }
];

export const AuthSystem = ({ onLogin }: AuthSystemProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = () => {
    if (!username || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password.",
        variant: "destructive"
      });
      return;
    }

    // Simple authentication (in real app, this would be proper authentication)
    const user = mockUsers.find(u => u.username === username);
    
    if (user && password === 'password') { // Simple password for demo
      onLogin(user);
      toast({
        title: "Login Successful",
        description: `Welcome ${user.name}!`
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-accent to-primary rounded-full opacity-10 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md mx-4 shadow-elegant border-0 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            YSOD Login
          </CardTitle>
          <p className="text-muted-foreground">
            Access the Digital Acknowledgment Hub
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <Button 
            onClick={handleLogin} 
            className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow border-0"
          >
            Login
          </Button>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border text-sm">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p><span className="font-medium">Admin:</span> admin / password</p>
              <p><span className="font-medium">User:</span> user1 / password</p>
              <p><span className="font-medium">User:</span> user2 / password</p>
              <p><span className="font-medium">Manager:</span> manager / password</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};