import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserSwitcher } from '@/components/UserSwitcher';
import { RoleBasedDashboard } from '@/components/RoleBasedDashboard';
import { LoginForm } from '@/components/LoginForm';
import { FileText, Shield, Laptop, Users, AlertTriangle, CheckCircle, Plus, Trash2, Download, Search, Mail, Send } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import jsPDF from 'jspdf';
interface AcknowledgmentItem {
  id: string;
  type: string;
  employeeName: string;
  employeeEmail: string;
  requestNo: string;
  date: string;
  acknowledged: boolean;
  supervisorEmail?: string;
  unit?: string;
  status: 'Pending' | 'Acknowledged' | 'Completed';
}

interface EmailNotification {
  to: string;
  type: 'employee_confirmation' | 'supervisor_notify' | 'admin_global';
  subject: string;
  body: string;
  submissionData: AcknowledgmentItem;
}
interface AcknowledgmentType {
  id: string;
  title: string;
  description: string;
  icon: any;
  content?: {
    arabic?: string;
    subtitle?: string;
    description?: string;
    rules?: string[];
  };
}
const defaultAcknowledgmentTypes: AcknowledgmentType[] = [{
  id: 'remote-work',
  title: 'Remote Area Working Acknowledgement',
  description: 'إقرار إلتزام بتعليمات العمل في المناطق النائية',
  icon: Laptop,
  content: {
    arabic: 'إقرار إلتزام بتعليمات العمل في المناطق النائية',
    subtitle: 'Remote Area Working Acknowledgement',
    description: `أقر بأنني تقدمت بناءاً على رغبتي واختياري بطلب الأنتقال للعمل في المنطقة النائية لمدة سنتين او في اي وقت يحدد حسب مايتطلبه العمل إستناداً إلى أنظمة التنقل في إدارة الأمن الصناعي

كما أنني أوافق على الشروط الواردة أدناه الخاصة بالعمل في المناطق النائية:-`,
    rules: ['إستخدام السكن الموفر من قبل الشركة طيلة فترة النوبة الأسبوعية.', 'إستخدام المواصلات الموفرة من قبل الشركة وعدم إستخدام المركبة الشخصية للتنقل للعمل', 'الإلتزام واتباع جميع أنظمة وتعليمات السلامة وفق سياسات وأنظمة الشركة.']
  }
}, {
  id: 'transfer',
  title: 'Transfer Acknowledgment',
  description: 'Acknowledge transfer policies and procedures',
  icon: FileText
}, {
  id: 'safety',
  title: 'Safety Acknowledgment',
  description: 'Acknowledge safety protocols and guidelines',
  icon: Shield
}, {
  id: 'security',
  title: 'Security Acknowledgment',
  description: 'Acknowledge security policies and data protection',
  icon: AlertTriangle
}, {
  id: 'training',
  title: 'Training Acknowledgment',
  description: 'Acknowledge completion of mandatory training',
  icon: Users
}];
export const AcknowledgmentSystem = () => {
  const { currentUser, isLoading, mockSupervisorList } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AcknowledgmentItem | null>(null);
  const [acknowledgmentTypes, setAcknowledgmentTypes] = useState<AcknowledgmentType[]>(defaultAcknowledgmentTypes);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);
  const [formData, setFormData] = useState({
    requestNo: '',
    employeeName: '',
    acknowledged: false
  });
  const [newTypeData, setNewTypeData] = useState({
    title: '',
    description: '',
    content: '',
    sections: ['']
  });
  const [submissions, setSubmissions] = useState<AcknowledgmentItem[]>([]);
  const [searchName, setSearchName] = useState<string>('');
  const { toast } = useToast();

  // Auto-fill employee name based on current user
  useEffect(() => {
    if (currentUser && currentUser.role === 'Employee') {
      setFormData(prev => ({
        ...prev,
        employeeName: currentUser.name
      }));
    }
  }, [currentUser, selectedType]);
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({
      requestNo: `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000000)}`,
      employeeName: '',
      acknowledged: false
    });
    setIsModalOpen(true);
  };
  const handleSubmit = () => {
    if (!formData.acknowledged) {
      toast({
        title: "Acknowledgment Required",
        description: "Please check the acknowledgment box to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) return;

    // Find supervisor and unit info
    const employeeInfo = mockSupervisorList.find(item => 
      item.employeeName === formData.employeeName
    );

    const newSubmission: AcknowledgmentItem = {
      id: Date.now().toString(),
      type: acknowledgmentTypes.find(t => t.id === selectedType)?.title || '',
      employeeName: formData.employeeName,
      employeeEmail: currentUser.email,
      requestNo: formData.requestNo,
      date: new Date().toLocaleDateString(),
      acknowledged: formData.acknowledged,
      supervisorEmail: employeeInfo?.supervisorEmail || currentUser.supervisorEmail,
      unit: employeeInfo?.unit || currentUser.unit,
      status: 'Completed'
    };

    setSubmissions([...submissions, newSubmission]);
    
    // Trigger email notifications
    triggerEmailNotifications(newSubmission);
    
    setIsModalOpen(false);
    toast({
      title: "Acknowledgment Submitted",
      description: "Your acknowledgment has been successfully recorded. Email notifications have been sent."
    });
  };

  const triggerEmailNotifications = (submission: AcknowledgmentItem) => {
    const notifications: EmailNotification[] = [];

    // 1. Confirmation email to employee
    notifications.push({
      to: submission.employeeEmail,
      type: 'employee_confirmation',
      subject: `Acknowledgment Confirmation - ${submission.requestNo}`,
      body: `Dear ${submission.employeeName},

Your acknowledgment submission has been successfully received and processed.

Details:
- Type: ${submission.type}
- Request No: ${submission.requestNo}
- Date: ${submission.date}
- Status: ${submission.status}

Thank you for your compliance.

Best regards,
YSOD Digital Acknowledgment System`,
      submissionData: submission
    });

    // 2. Notification to supervisor
    if (submission.supervisorEmail) {
      notifications.push({
        to: submission.supervisorEmail,
        type: 'supervisor_notify',
        subject: `Team Member Acknowledgment - ${submission.employeeName}`,
        body: `Dear Supervisor,

Your team member ${submission.employeeName} has submitted a new acknowledgment.

Details:
- Employee: ${submission.employeeName}
- Type: ${submission.type}
- Request No: ${submission.requestNo}
- Unit: ${submission.unit}
- Date: ${submission.date}

Please review in the system dashboard.

Best regards,
YSOD Digital Acknowledgment System`,
        submissionData: submission
      });
    }

    // 3. Global notification to all admins (optional)
    if (currentUser?.role !== 'Admin') {
      notifications.push({
        to: 'amer.alsomali@domain.com', // Admin email
        type: 'admin_global',
        subject: `New Acknowledgment Submission - ${submission.requestNo}`,
        body: `Dear Admin,

A new acknowledgment has been submitted in the system.

Details:
- Employee: ${submission.employeeName} (${submission.employeeEmail})
- Supervisor: ${submission.supervisorEmail}
- Type: ${submission.type}
- Unit: ${submission.unit}
- Date: ${submission.date}

Best regards,
YSOD Digital Acknowledgment System`,
        submissionData: submission
      });
    }

    setEmailNotifications(prev => [...prev, ...notifications]);
  };
// Moved handleAddNewType function above handleDeleteType
  const addSection = () => {
    setNewTypeData({
      ...newTypeData,
      sections: [...newTypeData.sections, '']
    });
  };
  const removeSection = (index: number) => {
    const newSections = newTypeData.sections.filter((_, i) => i !== index);
    setNewTypeData({
      ...newTypeData,
      sections: newSections.length > 0 ? newSections : ['']
    });
  };
  const updateSection = (index: number, value: string) => {
    const newSections = [...newTypeData.sections];
    newSections[index] = value;
    setNewTypeData({
      ...newTypeData,
      sections: newSections
    });
  };
  const handleDeleteType = (typeId: string) => {
    if (currentUser?.role !== 'Admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete acknowledgment types.",
        variant: "destructive"
      });
      return;
    }
    
    setAcknowledgmentTypes(acknowledgmentTypes.filter(type => type.id !== typeId));
    toast({
      title: "Acknowledgment Deleted",
      description: "Acknowledgment type has been deleted successfully."
    });
  };

  const handleAddNewType = () => {
    if (currentUser?.role !== 'Admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can add new acknowledgment types.",
        variant: "destructive"
      });
      return;
    }

    if (!newTypeData.title || !newTypeData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const newType: AcknowledgmentType = {
      id: `custom-${Date.now()}`,
      title: newTypeData.title,
      description: newTypeData.description,
      icon: FileText,
      content: {
        description: newTypeData.content,
        rules: newTypeData.sections.filter(section => section.trim() !== '')
      }
    };
    setAcknowledgmentTypes([...acknowledgmentTypes, newType]);
    setNewTypeData({
      title: '',
      description: '',
      content: '',
      sections: ['']
    });
    setIsAddTypeModalOpen(false);
    toast({
      title: "Acknowledgment Type Added",
      description: "New acknowledgment type has been created successfully."
    });
  };
  const handleOpenSubmission = (submission: AcknowledgmentItem) => {
    setSelectedSubmission(submission);
    setIsSubmissionModalOpen(true);
  };
  const exportSubmissionToPDF = (submission: AcknowledgmentItem) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('YSOD Digital Acknowledgment Form Hub', pageWidth / 2, 30, {
      align: 'center'
    });

    // Submission details
    doc.setFontSize(16);
    doc.text('Acknowledgment Submission', pageWidth / 2, 50, {
      align: 'center'
    });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPosition = 80;
    doc.text(`Type: ${submission.type}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Request No: ${submission.requestNo}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Employee Name: ${submission.employeeName}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Date: ${submission.date}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Status: ${submission.acknowledged ? 'Acknowledged' : 'Not Acknowledged'}`, 20, yPosition);

    // Find the acknowledgment type details
    const ackType = acknowledgmentTypes.find(type => type.title === submission.type);
    if (ackType?.content) {
      yPosition += 30;
      doc.setFont('helvetica', 'bold');
      doc.text('Content:', 20, yPosition);
      yPosition += 15;
      doc.setFont('helvetica', 'normal');
      if (ackType.content.description) {
        const lines = doc.splitTextToSize(ackType.content.description, pageWidth - 40);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 8;
      }
      if (ackType.content.rules && ackType.content.rules.length > 0) {
        yPosition += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Rules/Sections:', 20, yPosition);
        yPosition += 15;
        doc.setFont('helvetica', 'normal');
        ackType.content.rules.forEach((rule, index) => {
          const ruleText = `${index + 1}. ${rule}`;
          const lines = doc.splitTextToSize(ruleText, pageWidth - 40);
          doc.text(lines, 20, yPosition);
          yPosition += lines.length * 8 + 5;
        });
      }
    }

    // Footer
    yPosition += 30;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
    doc.save(`acknowledgment_${submission.requestNo}.pdf`);
    toast({
      title: "PDF Exported",
      description: "Acknowledgment has been exported successfully."
    });
  };

  // Filter submissions based on search name and user role
  const getFilteredSubmissions = () => {
    let filtered = submissions;
    
    // Role-based filtering
    if (currentUser?.role === 'Employee') {
      filtered = submissions.filter(sub => sub.employeeEmail === currentUser.email);
    } else if (currentUser?.role === 'Supervisor') {
      const supervisorUnits = mockSupervisorList
        .filter(item => item.supervisorEmail === currentUser.email)
        .map(item => item.unit);
      filtered = submissions.filter(sub => supervisorUnits.includes(sub.unit || ''));
    }
    
    // Search filtering
    if (searchName.trim() !== '') {
      filtered = filtered.filter(submission =>
        submission.employeeName.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return filtered;
  };

  const selectedAck = acknowledgmentTypes.find(t => t.id === selectedType);

  // Show loading state
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  // Show login form if not authenticated
  if (!currentUser) {
    return <LoginForm />;
  }

  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header with User Switcher and Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <UserSwitcher />
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            YSOD Digital Acknowledgment Form Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {currentUser.role === 'Admin' ? 'Full system administration and management' :
             currentUser.role === 'Supervisor' ? 'Manage your team acknowledgments and submissions' :
             'Select the type of acknowledgment you need to complete'}
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={currentUser.role === 'Employee' ? 'submit' : 'dashboard'} className="space-y-6">
          <TabsList className={`grid w-full ${currentUser.role === 'Employee' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {currentUser.role !== 'Employee' && (
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            )}
            <TabsTrigger value="submit">
              {currentUser.role === 'Employee' ? 'Acknowledgments' : 'Submit Acknowledgment'}
            </TabsTrigger>
            <TabsTrigger value="emails">Email Notifications</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          {currentUser.role !== 'Employee' && (
            <TabsContent value="dashboard">
              <RoleBasedDashboard />
            </TabsContent>
          )}

          {/* Submit Acknowledgment Tab */}
          <TabsContent value="submit" className="space-y-6">
            
            {/* Add New Type Button - Admin Only */}
            {currentUser.role === 'Admin' && (
              <div className="flex justify-end mb-6">
                <Button onClick={() => setIsAddTypeModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Acknowledgment Type
                </Button>
              </div>
            )}

            {/* Employee Role - Show Available Types Only */}
            {currentUser.role === 'Employee' && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Available Acknowledgment Types</h2>
                <p className="text-muted-foreground mb-6">Select an acknowledgment type to view and submit.</p>
              </div>
            )}

            {/* Acknowledgment Types Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {acknowledgmentTypes.map(type => {
                const IconComponent = type.icon;
                return <Card key={type.id} className="border hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50" onClick={() => handleTypeSelect(type.id)}>
                  <CardHeader className="text-center relative">
                    {type.id.startsWith('custom-') && currentUser.role === 'Admin' && (
                      <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={e => {
                        e.stopPropagation();
                        handleDeleteType(type.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {type.description}
                    </p>
                  </CardHeader>
                </Card>;
              })}
            </div>

            {/* Recent Submissions */}
            {submissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {currentUser.role === 'Employee' ? 'Your Submissions' :
                     currentUser.role === 'Supervisor' ? 'Team Submissions' : 'All Submissions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search Field */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder={`Search by employee name...`}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Submissions List */}
                  <div className="space-y-4">
                    {getFilteredSubmissions().length > 0 ? (
                      getFilteredSubmissions().map(submission => (
                        <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleOpenSubmission(submission)}>
                          <div>
                            <h3 className="font-medium">{submission.type}</h3>
                            <p className="text-muted-foreground text-sm">Request No: {submission.requestNo}</p>
                            <p className="text-muted-foreground text-sm">Employee: {submission.employeeName}</p>
                            {currentUser.role !== 'Employee' && (
                              <p className="text-muted-foreground text-sm">Unit: {submission.unit}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">{submission.date}</p>
                            <span className="inline-flex items-center gap-1 text-success text-sm">
                              <CheckCircle className="w-4 h-4" />
                              {submission.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : searchName ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No submissions found for "{searchName}"</p>
                        <p className="text-sm">Try searching with a different employee name</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No submissions found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Email Notifications Tab */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications Log
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEmailModalOpen(true)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    View All Emails
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emailNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {emailNotifications.slice(-5).reverse().map((email, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="font-medium">{email.subject}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            To: {email.to}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.body.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No email notifications yet</p>
                    <p className="text-sm">Email notifications will appear here when acknowledgments are submitted</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Acknowledgment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="bg-white p-8 space-y-6">
            {selectedAck?.id === 'remote-work' && selectedAck.content ? <>
                {/* Header with Arabic title */}
                <div className="text-center border-b pb-6">
                  <h1 className="text-2xl font-bold text-red-600 mb-2" dir="rtl">
                    {selectedAck.content.arabic}
                  </h1>
                  <h2 className="text-lg text-gray-700">
                    {selectedAck.content.subtitle}
                  </h2>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div className="text-right" dir="rtl">
                    <p className="text-gray-800 leading-relaxed text-base">
                      {selectedAck.content.description}
                    </p>
                  </div>

                   {selectedAck.content.rules && <div className="text-right" dir="rtl">
                       <ol className="list-decimal list-inside space-y-2 text-gray-800">
                         {selectedAck.content.rules.map((rule, index) => <li key={index} className="leading-relaxed">
                             {rule}
                           </li>)}
                       </ol>
                     </div>}
                </div>

                {/* Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-blue-800 text-sm">
                      The content of this item will be sent as an e-mail message to the person or group assigned to the item.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-gray-50 p-6 space-y-4">
                  <h3 className="font-semibold text-gray-700 bg-gray-200 px-3 py-2">Request Information</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label className="text-sm font-medium text-gray-700">Request No:</Label>
                      <div className="col-span-2">
                        <Input value={formData.requestNo} onChange={e => setFormData({
                      ...formData,
                      requestNo: e.target.value
                    })} className="border-gray-300" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label className="text-sm font-medium text-gray-700">Employee Name:</Label>
                      <div className="col-span-2">
                        <Input 
                          value={formData.employeeName} 
                          onChange={e => setFormData({
                            ...formData,
                            employeeName: e.target.value
                          })} 
                          className="border-gray-300" 
                          placeholder="Enter employee name"
                          disabled={currentUser?.role === 'Employee'}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 items-start gap-4">
                      <Label className="text-sm font-medium text-gray-700">Acknowledgment *</Label>
                      <div className="col-span-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox checked={formData.acknowledged} onCheckedChange={checked => setFormData({
                        ...formData,
                        acknowledged: checked as boolean
                      })} className="mt-1" />
                          <label className="text-sm text-gray-700 leading-relaxed">
                            I acknowledge that I have read, understood and agree to the above policies and procedures
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6">
                    Submit
                  </Button>
                  <Button variant="destructive" onClick={() => setIsModalOpen(false)} className="bg-red-600 hover:bg-red-700 px-6">
                    Cancel
                  </Button>
                </div>
              </> : <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedAck?.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Content */}
                  {selectedAck?.content?.description && <div className="text-right" dir="rtl">
                      <p className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
                        {selectedAck.content.description}
                      </p>
                    </div>}

                  {/* Numbered Rules */}
                  {selectedAck?.content?.rules && selectedAck.content.rules.length > 0 && <div className="text-right" dir="rtl">
                      <ol className="list-decimal list-inside space-y-2 text-gray-800">
                        {selectedAck.content.rules.map((rule, index) => <li key={index} className="leading-relaxed">
                            {rule}
                          </li>)}
                      </ol>
                    </div>}

                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      <p className="text-blue-800 text-sm">
                        The content of this item will be sent as an e-mail message to the person or group assigned to the item.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 space-y-4">
                    <h3 className="font-semibold text-gray-700 bg-gray-200 px-3 py-2">Request Information</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-sm font-medium text-gray-700">Request No:</Label>
                        <div className="col-span-2">
                          <Input value={formData.requestNo} onChange={e => setFormData({
                        ...formData,
                        requestNo: e.target.value
                      })} className="border-gray-300" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-sm font-medium text-gray-700">Employee Name:</Label>
                        <div className="col-span-2">
                          <Input value={formData.employeeName} onChange={e => setFormData({
                        ...formData,
                        employeeName: e.target.value
                      })} className="border-gray-300" placeholder="Enter employee name" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 items-start gap-4">
                        <Label className="text-sm font-medium text-gray-700">Acknowledgment *</Label>
                        <div className="col-span-2">
                          <div className="flex items-start space-x-2">
                            <Checkbox checked={formData.acknowledged} onCheckedChange={checked => setFormData({
                          ...formData,
                          acknowledged: checked as boolean
                        })} className="mt-1" />
                            <label className="text-sm text-gray-700 leading-relaxed">
                              I acknowledge that I have read, understood and agree to the above policies and procedures
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6">
                      Submit
                    </Button>
                    <Button variant="destructive" onClick={() => setIsModalOpen(false)} className="bg-red-600 hover:bg-red-700 px-6">
                      Cancel
                    </Button>
                  </div>
                </div>
              </>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Type Modal */}
      <Dialog open={isAddTypeModalOpen} onOpenChange={setIsAddTypeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Acknowledgment Type</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Title *</Label>
                <Input value={newTypeData.title} onChange={e => setNewTypeData({
                ...newTypeData,
                title: e.target.value
              })} placeholder="Enter acknowledgment title" className="border-gray-300" />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description *</Label>
                <Input value={newTypeData.description} onChange={e => setNewTypeData({
                ...newTypeData,
                description: e.target.value
              })} placeholder="Enter brief description" className="border-gray-300" />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Content (Optional)</Label>
                <Textarea value={newTypeData.content} onChange={e => setNewTypeData({
                ...newTypeData,
                content: e.target.value
              })} placeholder="Enter detailed acknowledgment content" className="border-gray-300 min-h-[120px]" />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Numbered Sections/Rules (Optional)</Label>
                <div className="space-y-3">
                  {newTypeData.sections.map((section, index) => <div key={index} className="flex gap-2">
                      <span className="text-sm text-gray-500 mt-2 min-w-[20px]">{index + 1}.</span>
                      <Textarea value={section} onChange={e => updateSection(index, e.target.value)} placeholder={`Enter section ${index + 1} content`} className="border-gray-300 flex-1" rows={2} />
                      {newTypeData.sections.length > 1 && <Button type="button" variant="outline" size="sm" onClick={() => removeSection(index)} className="mt-1 text-red-600 hover:text-red-700">
                          Remove
                        </Button>}
                    </div>)}
                  <Button type="button" variant="outline" size="sm" onClick={addSection} className="text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddNewType} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Add Type
              </Button>
              <Button variant="outline" onClick={() => setIsAddTypeModalOpen(false)} className="px-6">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission View Modal */}
      <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && <div className="bg-white p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center justify-between">
                  {selectedSubmission.type}
                  
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Submission Info */}
                <div className="bg-gray-50 p-6 space-y-4">
                  <h3 className="font-semibold text-gray-700 bg-gray-200 px-3 py-2">Submission Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Request No:</Label>
                      <p className="text-gray-900">{selectedSubmission.requestNo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Employee Name:</Label>
                      <p className="text-gray-900">{selectedSubmission.employeeName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Date:</Label>
                      <p className="text-gray-900">{selectedSubmission.date}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status:</Label>
                      <span className="inline-flex items-center gap-1 text-success">
                        <CheckCircle className="w-4 h-4" />
                        Acknowledged
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Display */}
                {(() => {
              const ackType = acknowledgmentTypes.find(type => type.title === selectedSubmission.type);
              if (ackType?.content) {
                return <div className="space-y-6">
                        {ackType.content.arabic && <div className="text-center border-b pb-6">
                            <h1 className="text-2xl font-bold text-red-600 mb-2" dir="rtl">
                              {ackType.content.arabic}
                            </h1>
                            {ackType.content.subtitle && <h2 className="text-lg text-gray-700">
                                {ackType.content.subtitle}
                              </h2>}
                          </div>}

                        {ackType.content.description && <div className="text-right" dir="rtl">
                            <p className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
                              {ackType.content.description}
                            </p>
                          </div>}

                        {ackType.content.rules && ackType.content.rules.length > 0 && <div className="text-right" dir="rtl">
                            <ol className="list-decimal list-inside space-y-2 text-gray-800">
                              {ackType.content.rules.map((rule, index) => <li key={index} className="leading-relaxed">
                                  {rule}
                                </li>)}
                            </ol>
                          </div>}
                      </div>;
              }
              return null;
            })()}

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-blue-800 text-sm">
                      This acknowledgment has been digitally signed and recorded in the system.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={() => exportSubmissionToPDF(selectedSubmission)} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={() => setIsSubmissionModalOpen(false)} className="px-6">
                    Close
                  </Button>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
};