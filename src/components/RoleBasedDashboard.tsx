import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { SubmissionHistory } from '@/types/user';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Search,
  Bell,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  myTeamSubmissions?: number;
  unitsManaged?: number;
}

export const RoleBasedDashboard = () => {
  const { currentUser, mockSupervisorList } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0
  });

  // Mock submission data
  useEffect(() => {
    const mockSubmissions: SubmissionHistory[] = [
      {
        requestNo: '2024/000001',
        employeeName: 'Ahmed Khaled',
        employeeEmail: 'ahmed.khaled@domain.com',
        supervisor: 'supervisorA@domain.com',
        type: 'Remote Area Working Acknowledgement',
        date: '2024-01-15',
        status: 'Completed',
        submittedBy: 'ahmed.khaled@domain.com',
        unit: 'Unit A'
      },
      {
        requestNo: '2024/000002',
        employeeName: 'Reem Abdullah',
        employeeEmail: 'reem.abdullah@domain.com',
        supervisor: 'supervisorB@domain.com',
        type: 'Safety Acknowledgment',
        date: '2024-01-16',
        status: 'Pending',
        submittedBy: 'reem.abdullah@domain.com',
        unit: 'Unit B'
      },
      {
        requestNo: '2024/000003',
        employeeName: 'Mohammed Hassan',
        employeeEmail: 'mohammed.hassan@domain.com',
        supervisor: 'supervisorA@domain.com',
        type: 'Transfer Acknowledgment',
        date: '2024-01-17',
        status: 'Completed',
        submittedBy: 'mohammed.hassan@domain.com',
        unit: 'Unit A'
      },
      {
        requestNo: '2024/000004',
        employeeName: 'Sara Ahmed',
        employeeEmail: 'sara.ahmed@domain.com',
        supervisor: 'supervisorB@domain.com',
        type: 'Training Acknowledgment',
        date: '2024-01-18',
        status: 'Acknowledged',
        submittedBy: 'sara.ahmed@domain.com',
        unit: 'Unit B'
      },
      {
        requestNo: '2024/000005',
        employeeName: 'Omar Khalil',
        employeeEmail: 'omar.khalil@domain.com',
        supervisor: 'supervisorC@domain.com',
        type: 'Security Acknowledgment',
        date: '2024-01-19',
        status: 'Pending',
        submittedBy: 'omar.khalil@domain.com',
        unit: 'Unit C'
      }
    ];

    setSubmissions(mockSubmissions);
    
    // Calculate stats based on user role
    const calculateStats = () => {
      let filteredSubmissions = mockSubmissions;
      
      if (currentUser?.role === 'Supervisor') {
        // Filter by supervisor's team
        const supervisorUnits = mockSupervisorList
          .filter(item => item.supervisorEmail === currentUser.email)
          .map(item => item.unit)
          .filter((value, index, self) => self.indexOf(value) === index);
        
        filteredSubmissions = mockSubmissions.filter(sub => 
          supervisorUnits.includes(sub.unit || '')
        );
      } else if (currentUser?.role === 'Employee') {
        // Filter by employee's own submissions
        filteredSubmissions = mockSubmissions.filter(sub => 
          sub.employeeEmail === currentUser.email
        );
      }

      return {
        totalSubmissions: filteredSubmissions.length,
        pendingSubmissions: filteredSubmissions.filter(s => s.status === 'Pending').length,
        completedSubmissions: filteredSubmissions.filter(s => s.status === 'Completed').length,
        myTeamSubmissions: currentUser?.role === 'Supervisor' ? filteredSubmissions.length : undefined,
        unitsManaged: currentUser?.role === 'Supervisor' ? 
          mockSupervisorList
            .filter(item => item.supervisorEmail === currentUser.email)
            .map(item => item.unit)
            .filter((value, index, self) => self.indexOf(value) === index).length 
          : undefined
      };
    };

    setStats(calculateStats());
  }, [currentUser, mockSupervisorList]);

  const getFilteredSubmissions = () => {
    let filtered = submissions;

    // Role-based filtering
    if (currentUser?.role === 'Supervisor') {
      const supervisorUnits = mockSupervisorList
        .filter(item => item.supervisorEmail === currentUser.email)
        .map(item => item.unit);
      
      filtered = submissions.filter(sub => 
        supervisorUnits.includes(sub.unit || '')
      );
    } else if (currentUser?.role === 'Employee') {
      filtered = submissions.filter(sub => 
        sub.employeeEmail === currentUser.email
      );
    }

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.requestNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Acknowledged': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canViewReports = currentUser?.role === 'Admin' || currentUser?.role === 'Supervisor';
  const canManageAll = currentUser?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {currentUser?.role === 'Employee' ? 'Your submissions' : 
               currentUser?.role === 'Supervisor' ? 'Team submissions' : 'All submissions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting acknowledgment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Fully processed
            </p>
          </CardContent>
        </Card>

        {currentUser?.role === 'Supervisor' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Units Managed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unitsManaged}</div>
              <p className="text-xs text-muted-foreground">
                Teams under supervision
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions">
            <FileText className="w-4 h-4 mr-2" />
            Submissions
          </TabsTrigger>
          {canViewReports && (
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {currentUser?.role === 'Employee' ? 'My Submissions' :
                   currentUser?.role === 'Supervisor' ? 'Team Submissions' : 'All Submissions'}
                </CardTitle>
                {canViewReports && (
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Submissions List */}
                <div className="space-y-2">
                  {getFilteredSubmissions().map((submission) => (
                    <div key={submission.requestNo} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{submission.employeeName}</p>
                          <Badge variant="outline" className="text-xs">
                            {submission.unit}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{submission.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Request: {submission.requestNo} • {submission.date}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        {canManageAll && (
                          <p className="text-xs text-muted-foreground">
                            Supervisor: {submission.supervisor.split('@')[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canViewReports && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Submission Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Analytics dashboard showing submission patterns, completion rates, and team performance metrics.
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm">📊 Chart visualization would appear here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unit Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Unit A</span>
                      <span className="text-sm font-medium">85% completion</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Unit B</span>
                      <span className="text-sm font-medium">92% completion</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Unit C</span>
                      <span className="text-sm font-medium">78% completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentUser?.role === 'Admin' && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Global Submission Alert</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New submission from Ahmed Khaled - Remote Area Working Acknowledgement
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                )}

                {currentUser?.role === 'Supervisor' && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Team Member Submission</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your team member has submitted a new acknowledgment for review
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Submission Confirmed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your acknowledgment submission has been processed successfully
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};