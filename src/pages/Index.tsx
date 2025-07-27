import { useState } from 'react';
import { AcknowledgmentSystem } from '@/components/AcknowledgmentSystem';
import { AuthSystem, UserData } from '@/components/AuthSystem';

const Index = () => {
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthSystem onLogin={handleLogin} />;
  }

  return <AcknowledgmentSystem user={user} onLogout={handleLogout} />;
};

export default Index;
