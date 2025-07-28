import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail } from 'lucide-react';
import { sharePointService } from '@/services/sharepoint';

export interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthSystemProps {
  onLogin: (user: UserData) => void;
}

export const AuthSystem = ({ onLogin }: AuthSystemProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user email from SharePoint context
  const getSharePointUserEmail = async (): Promise<string | null> => {
    try {
      // Get current user from SharePoint context
      const currentUser = sharePointService.getCurrentUser();
      return currentUser?.email || null;
    } catch (error) {
      console.error('Error getting SharePoint user:', error);
      return null;
    }
  };

  const handleAutoLogin = async () => {
    try {
      const userEmail = await getSharePointUserEmail();
      
      if (!userEmail) {
        toast({
          title: "Authentication Error",
          description: "Unable to retrieve user information from SharePoint.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      setCurrentUserEmail(userEmail);
      
      // Get user from SharePoint Users list
      const sharePointUser = await sharePointService.getUserByEmail(userEmail);
      
      if (sharePointUser) {
        const user: UserData = {
          id: sharePointUser.Id.toString(),
          email: sharePointUser.Title,
          role: sharePointUser.UserRole.toLowerCase() as 'admin' | 'user',
          name: sharePointUser.UserName
        };

        onLogin(user);
        toast({
          title: "Login Successful",
          description: `Welcome ${user.name}!`
        });
      } else {
        toast({
          title: "Access Denied",
          description: "User not found in the system. Please contact your administrator.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with SharePoint.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleAutoLogin();
  }, []);

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
        
        <CardContent className="space-y-6 text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Authenticating with SharePoint...</p>
                <p className="text-sm text-muted-foreground">
                  Retrieving your user information
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-destructive">Authentication Failed</p>
                <p className="text-sm text-muted-foreground">
                  Unable to authenticate with SharePoint
                </p>
              </div>
              {currentUserEmail && (
                <p className="text-sm text-muted-foreground">
                  User: {currentUserEmail}
                </p>
              )}
            </div>
          )}

          {/* SharePoint integration info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border text-sm text-left">
            <p className="font-semibold mb-2">SharePoint Integration:</p>
            <div className="space-y-1 text-xs">
              <p>• Automatically reads user email from SharePoint context</p>
              <p>• No manual login required</p>
              <p>• Role assignment based on email domain</p>
              <p>• Current demo user: {currentUserEmail || 'Loading...'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};