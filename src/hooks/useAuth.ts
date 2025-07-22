import { useState, useEffect } from 'react';
import { User } from '@/types/user';

// Simulated SharePoint data
const mockAdminList = [
  { title: 'amer.alsomali@domain.com', role: 'Admin' as const },
  { title: 'admin2@domain.com', role: 'Admin' as const }
];

const mockSupervisorList = [
  { employeeName: 'Ahmed Khaled', supervisorEmail: 'supervisorA@domain.com', unit: 'YSOD Unit #1' },
  { employeeName: 'Reem Abdullah', supervisorEmail: 'supervisorB@domain.com', unit: 'YSOD Unit #2' },
  { employeeName: 'Mohammed Hassan', supervisorEmail: 'supervisorA@domain.com', unit: 'YSOD Unit #3' },
  { employeeName: 'Sara Ahmed', supervisorEmail: 'supervisorB@domain.com', unit: 'YSOD Unit #4' },
  { employeeName: 'Omar Khalil', supervisorEmail: 'supervisorC@domain.com', unit: 'YST Unit & Day Concept' },
  { employeeName: 'Nour Ali', supervisorEmail: 'supervisorD@domain.com', unit: 'YSOD Unit #1' },
  { employeeName: 'Khalid Omar', supervisorEmail: 'supervisorE@domain.com', unit: 'YSOD Unit #2' }
];

const mockUsers = [
  'amer.alsomali@domain.com',
  'supervisorA@domain.com', 
  'supervisorB@domain.com',
  'supervisorC@domain.com',
  'supervisorD@domain.com',
  'supervisorE@domain.com',
  'ahmed.khaled@domain.com',
  'reem.abdullah@domain.com',
  'mohammed.hassan@domain.com',
  'sara.ahmed@domain.com',
  'omar.khalil@domain.com',
  'nour.ali@domain.com',
  'khalid.omar@domain.com'
];

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const determineUserRole = (email: string): User | null => {
    // Check if user is Admin
    const isAdmin = mockAdminList.find(admin => admin.title === email);
    if (isAdmin) {
      return {
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: 'Admin'
      };
    }

    // Check if user is Supervisor
    const supervisorUnits = mockSupervisorList.filter(item => item.supervisorEmail === email);
    if (supervisorUnits.length > 0) {
      return {
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: 'Supervisor',
        unit: supervisorUnits[0].unit
      };
    }

    // Check if user is Employee
    const employeeInfo = mockSupervisorList.find(item => 
      item.employeeName.toLowerCase().replace(' ', '.') + '@domain.com' === email
    );
    if (employeeInfo) {
      return {
        email,
        name: employeeInfo.employeeName,
        role: 'Employee',
        unit: employeeInfo.unit,
        supervisorEmail: employeeInfo.supervisorEmail
      };
    }

    return null;
  };

  const login = (email: string) => {
    const user = determineUserRole(email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchUser = (email: string) => {
    const user = determineUserRole(email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return user;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  return {
    currentUser,
    isLoading,
    login,
    logout,
    switchUser,
    mockUsers,
    mockSupervisorList
  };
};