import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield, Laptop, Users, AlertTriangle, CheckCircle, Plus, Trash2, Download, Search, Edit } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import jsPDF from 'jspdf';
interface AcknowledgmentItem {
  id: string;
  type: string;
  employeeName: string;
  requestNo: string;
  date: string;
  acknowledged: boolean;
}
interface AcknowledgmentType {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconImage?: string;
  backgroundImage?: string;
  textColor?: string;
  textAlignment?: 'left' | 'center' | 'right';
  isArabic?: boolean;
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
  isArabic: true,
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
  icon: FileText,
  isArabic: false
}, {
  id: 'safety',
  title: 'Safety Acknowledgment',
  description: 'Acknowledge safety protocols and guidelines',
  icon: Shield,
  isArabic: false
}, {
  id: 'security',
  title: 'Security Acknowledgment',
  description: 'Acknowledge security policies and data protection',
  icon: AlertTriangle,
  isArabic: false
}, {
  id: 'training',
  title: 'Training Acknowledgment',
  description: 'Acknowledge completion of mandatory training',
  icon: Users,
  isArabic: false
}];
export const AcknowledgmentSystem = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AcknowledgmentType | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AcknowledgmentItem | null>(null);
  const [acknowledgmentTypes, setAcknowledgmentTypes] = useState<AcknowledgmentType[]>(defaultAcknowledgmentTypes);
  const [formData, setFormData] = useState({
    requestNo: '',
    employeeName: '',
    acknowledged: false
  });
  const [newTypeData, setNewTypeData] = useState({
    title: '',
    description: '',
    content: '',
    sections: [''],
    iconImage: '',
    backgroundImage: '',
    textColor: '#000000',
    textAlignment: 'left' as 'left' | 'center' | 'right',
    isArabic: false
  });
  const [submissions, setSubmissions] = useState<AcknowledgmentItem[]>([]);
  const [searchName, setSearchName] = useState<string>('');
  const {
    toast
  } = useToast();
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
    const newSubmission: AcknowledgmentItem = {
      id: Date.now().toString(),
      type: acknowledgmentTypes.find(t => t.id === selectedType)?.title || '',
      employeeName: formData.employeeName,
      requestNo: formData.requestNo,
      date: new Date().toLocaleDateString(),
      acknowledged: formData.acknowledged
    };
    setSubmissions([...submissions, newSubmission]);
    setIsModalOpen(false);
    toast({
      title: "Acknowledgment Submitted",
      description: "Your acknowledgment has been successfully recorded."
    });
  };
  const handleAddNewType = () => {
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
      iconImage: newTypeData.iconImage,
      backgroundImage: newTypeData.backgroundImage,
      textColor: newTypeData.textColor,
      textAlignment: newTypeData.textAlignment,
      isArabic: newTypeData.isArabic,
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
      sections: [''],
      iconImage: '',
      backgroundImage: '',
      textColor: '#000000',
      textAlignment: 'left' as 'left' | 'center' | 'right',
      isArabic: false
    });
    setIsAddTypeModalOpen(false);
    toast({
      title: "Acknowledgment Type Added",
      description: "New acknowledgment type has been created successfully."
    });
  };
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
    setAcknowledgmentTypes(acknowledgmentTypes.filter(type => type.id !== typeId));
    toast({
      title: "Acknowledgment Deleted",
      description: "Acknowledgment type has been deleted successfully."
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'background') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewTypeData({
          ...newTypeData,
          [type === 'icon' ? 'iconImage' : 'backgroundImage']: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditType = (type: AcknowledgmentType) => {
    setEditingType(type);
    setNewTypeData({
      title: type.title,
      description: type.description,
      content: type.content?.description || '',
      sections: type.content?.rules || [''],
      iconImage: type.iconImage || '',
      backgroundImage: type.backgroundImage || '',
      textColor: type.textColor || '#000000',
      textAlignment: type.textAlignment || 'left',
      isArabic: type.isArabic || false
    });
    setIsEditTypeModalOpen(true);
  };

  const handleUpdateType = () => {
    if (!editingType || !newTypeData.title || !newTypeData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const updatedType: AcknowledgmentType = {
      ...editingType,
      title: newTypeData.title,
      description: newTypeData.description,
      iconImage: newTypeData.iconImage,
      backgroundImage: newTypeData.backgroundImage,
      textColor: newTypeData.textColor,
      textAlignment: newTypeData.textAlignment,
      isArabic: newTypeData.isArabic,
      content: {
        ...editingType.content,
        description: newTypeData.content,
        rules: newTypeData.sections.filter(section => section.trim() !== '')
      }
    };

    setAcknowledgmentTypes(acknowledgmentTypes.map(type => 
      type.id === editingType.id ? updatedType : type
    ));
    
    setNewTypeData({
      title: '',
      description: '',
      content: '',
      sections: [''],
      iconImage: '',
      backgroundImage: '',
      textColor: '#000000',
      textAlignment: 'left' as 'left' | 'center' | 'right',
      isArabic: false
    });
    setEditingType(null);
    setIsEditTypeModalOpen(false);
    toast({
      title: "Acknowledgment Updated",
      description: "Acknowledgment type has been updated successfully."
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

  // Filter submissions based on search name
  const filteredSubmissions = submissions.filter(submission => 
    searchName.trim() === '' || 
    submission.employeeName.toLowerCase().includes(searchName.toLowerCase())
  );

  const selectedAck = acknowledgmentTypes.find(t => t.id === selectedType);
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-accent to-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-card rounded-full opacity-5 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              YSOD Digital Acknowledgment Form Hub
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select the type of acknowledgment you need to complete
            </p>
          </div>
          <div className="ml-8">
            <ThemeToggle />
          </div>
        </div>

        {/* Add New Type Button */}
        <div className="flex justify-end mb-6">
          <Button onClick={() => setIsAddTypeModalOpen(true)} className="bg-gradient-primary hover:opacity-90 text-white shadow-glow border-0">
            <Plus className="w-4 h-4 mr-2" />
            Add New Acknowledgment Type
          </Button>
        </div>

        {/* Acknowledgment Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {acknowledgmentTypes.map(type => {
          const IconComponent = type.icon;
          return <Card 
            key={type.id} 
            className="border hover:shadow-elegant transition-all duration-300 cursor-pointer hover:border-primary/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 group relative overflow-hidden" 
            onClick={() => handleTypeSelect(type.id)}
            style={{
              backgroundImage: type.backgroundImage ? `url(${type.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
                {type.backgroundImage && <div className="absolute inset-0 bg-black/20"></div>}
                <CardHeader className={`text-center relative z-10 ${type.textAlignment === 'center' ? 'text-center' : type.textAlignment === 'right' ? 'text-right' : 'text-left'}`}>
                  {!type.id.startsWith('default-') && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={e => {
                        e.stopPropagation();
                        handleEditType(type);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={e => {
                        e.stopPropagation();
                        handleDeleteType(type.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    {type.iconImage ? (
                      <img src={type.iconImage} alt="Icon" className="w-8 h-8 object-cover rounded-full" />
                    ) : (
                      <IconComponent className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <CardTitle 
                    className="text-lg" 
                    style={{ color: type.textColor || undefined }}
                  >
                    {type.title}
                  </CardTitle>
                  <p 
                    className="text-muted-foreground text-sm"
                    style={{ color: type.textColor ? `${type.textColor}CC` : undefined }}
                  >
                    {type.description}
                  </p>
                </CardHeader>
              </Card>;
        })}
        </div>

        {/* Recent Submissions */}
        {submissions.length > 0 && <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Your Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Field */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by employee name to view your submissions..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-4">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map(submission => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleOpenSubmission(submission)}>
                      <div>
                        <h3 className="font-medium">{submission.type}</h3>
                        <p className="text-muted-foreground text-sm">Request No: {submission.requestNo}</p>
                        <p className="text-muted-foreground text-sm">Employee: {submission.employeeName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-sm">{submission.date}</p>
                        <span className="inline-flex items-center gap-1 text-success text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Acknowledged
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
                    <p>Enter an employee name to search for submissions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>}
      </div>

      {/* Acknowledgment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white p-8 space-y-6">
            {selectedAck?.id === 'remote-work' && selectedAck.content ? <>
                {/* Header with Arabic title */}
                <div className="text-center space-y-3 pb-6">
                  <h1 className="text-2xl font-bold text-red-600" dir="rtl">
                    {selectedAck.content.arabic}
                  </h1>
                  <h2 className="text-lg text-gray-700 font-medium">
                    {selectedAck.content.subtitle}
                  </h2>
                  <hr className="border-gray-300 mx-auto w-full" />
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div className="text-right" dir="rtl">
                    <p className="text-gray-800 leading-relaxed text-base">
                      {selectedAck.content.description}
                    </p>
                  </div>

                   {selectedAck.content.rules && <div className="text-right space-y-3" dir="rtl">
                        {selectedAck.content.rules.map((rule, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <span className="text-gray-800 font-medium min-w-[20px] text-left">
                              {index + 1}.
                            </span>
                            <span className="text-gray-800 leading-relaxed flex-1 text-right">
                              {rule}
                            </span>
                          </div>
                        ))}
                      </div>}
                </div>

                {/* Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-blue-800 text-sm">
                      The content of this item will be sent as an e-mail message to the person or group assigned to the item.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  <div className="bg-gray-100 px-4 py-3 -mx-8">
                    <h3 className="font-semibold text-gray-700">Request Information</h3>
                  </div>
                  
                  <div className="space-y-6 px-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Request No:</Label>
                      <Input 
                        value={formData.requestNo} 
                        onChange={e => setFormData({
                          ...formData,
                          requestNo: e.target.value
                        })} 
                        className="bg-gray-900 text-white border-2 border-blue-500 focus:border-blue-400 rounded-md h-10" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Employee Name:</Label>
                      <Input 
                        value={formData.employeeName} 
                        onChange={e => setFormData({
                          ...formData,
                          employeeName: e.target.value
                        })} 
                        className="bg-gray-900 text-white border-2 border-blue-500 focus:border-blue-400 rounded-md h-10" 
                        placeholder="Enter employee name" 
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Acknowledgment *</Label>
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          checked={formData.acknowledged} 
                          onCheckedChange={checked => setFormData({
                            ...formData,
                            acknowledged: checked as boolean
                          })} 
                          className="mt-1 border-blue-500 data-[state=checked]:bg-blue-500" 
                        />
                        <label className="text-sm text-gray-700 leading-relaxed flex-1">
                          {selectedAck?.isArabic ? 
                            'أقر بأنني قد قرأت وفهمت ووافقت على السياسات والإجراءات المذكورة أعلاه' : 
                            'I acknowledge that I have read, understood and agree to the above policies and procedures'
                          }
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6 px-4">
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md font-medium">
                    Submit
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-md font-medium">
                    Cancel
                  </Button>
                </div>
              </> : <>
                {/* All acknowledgment types now follow the same layout */}
                <div className="text-center space-y-3 pb-6">
                  <h1 className="text-2xl font-bold text-red-600" dir="rtl">
                    {selectedAck?.isArabic ? selectedAck?.description : selectedAck?.title}
                  </h1>
                  <h2 className="text-lg text-gray-700 font-medium">
                    {selectedAck?.isArabic ? selectedAck?.title : selectedAck?.description}
                  </h2>
                  <hr className="border-gray-300 mx-auto w-full" />
                </div>
                
                <div className="space-y-6">
                  {/* Content */}
                  {/* Content */}
                  {selectedAck?.content?.description && <div className="text-right" dir="rtl">
                      <p className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
                        {selectedAck.content.description}
                      </p>
                    </div>}

                  {/* Numbered Rules */}
                  {selectedAck?.content?.rules && selectedAck.content.rules.length > 0 && <div className="text-right space-y-3" dir="rtl">
                      {selectedAck.content.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-gray-800 font-medium min-w-[20px] text-left">
                            {index + 1}.
                          </span>
                          <span className="text-gray-800 leading-relaxed flex-1 text-right">
                            {rule}
                          </span>
                        </div>
                      ))}
                    </div>}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      <p className="text-blue-800 text-sm">
                        The content of this item will be sent as an e-mail message to the person or group assigned to the item.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-100 px-4 py-3 -mx-8">
                      <h3 className="font-semibold text-gray-700">Request Information</h3>
                    </div>
                    
                    <div className="space-y-6 px-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Request No:</Label>
                        <Input 
                          value={formData.requestNo} 
                          onChange={e => setFormData({
                            ...formData,
                            requestNo: e.target.value
                          })} 
                          className="bg-gray-900 text-white border-2 border-blue-500 focus:border-blue-400 rounded-md h-10" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Employee Name:</Label>
                        <Input 
                          value={formData.employeeName} 
                          onChange={e => setFormData({
                            ...formData,
                            employeeName: e.target.value
                          })} 
                          className="bg-gray-900 text-white border-2 border-blue-500 focus:border-blue-400 rounded-md h-10" 
                          placeholder="Enter employee name" 
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Acknowledgment *</Label>
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            checked={formData.acknowledged} 
                            onCheckedChange={checked => setFormData({
                              ...formData,
                              acknowledged: checked as boolean
                            })} 
                            className="mt-1 border-blue-500 data-[state=checked]:bg-blue-500" 
                          />
                          <label className="text-sm text-gray-700 leading-relaxed flex-1">
                            {selectedAck?.isArabic ? 
                              'أقر بأنني قد قرأت وفهمت ووافقت على السياسات والإجراءات المذكورة أعلاه' : 
                              'I acknowledge that I have read, understood and agree to the above policies and procedures'
                            }
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 px-4">
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md font-medium">
                      Submit
                    </Button>
                    <Button onClick={() => setIsModalOpen(false)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-md font-medium">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Icon Image (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'icon')}
                      className="border-gray-300"
                    />
                    {newTypeData.iconImage && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border">
                        <img src={newTypeData.iconImage} alt="Icon preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Background Image (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'background')}
                      className="border-gray-300"
                    />
                    {newTypeData.backgroundImage && (
                      <div className="w-full h-20 rounded overflow-hidden border">
                        <img src={newTypeData.backgroundImage} alt="Background preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Text Color</Label>
                  <Input
                    type="color"
                    value={newTypeData.textColor}
                    onChange={(e) => setNewTypeData({
                      ...newTypeData,
                      textColor: e.target.value
                    })}
                    className="border-gray-300 h-10"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Text Alignment</Label>
                  <select
                    value={newTypeData.textAlignment}
                    onChange={(e) => setNewTypeData({
                      ...newTypeData,
                      textAlignment: e.target.value as 'left' | 'center' | 'right'
                    })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Language</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="language"
                      checked={!newTypeData.isArabic}
                      onChange={() => setNewTypeData({ ...newTypeData, isArabic: false })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">English</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="language"
                      checked={newTypeData.isArabic}
                      onChange={() => setNewTypeData({ ...newTypeData, isArabic: true })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Arabic</span>
                  </label>
                </div>
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

      {/* Edit Type Modal */}
      <Dialog open={isEditTypeModalOpen} onOpenChange={setIsEditTypeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Acknowledgment Type</DialogTitle>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Icon Image (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'icon')}
                      className="border-gray-300"
                    />
                    {newTypeData.iconImage && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border">
                        <img src={newTypeData.iconImage} alt="Icon preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Background Image (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'background')}
                      className="border-gray-300"
                    />
                    {newTypeData.backgroundImage && (
                      <div className="w-full h-20 rounded overflow-hidden border">
                        <img src={newTypeData.backgroundImage} alt="Background preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Text Color</Label>
                  <Input
                    type="color"
                    value={newTypeData.textColor}
                    onChange={(e) => setNewTypeData({
                      ...newTypeData,
                      textColor: e.target.value
                    })}
                    className="border-gray-300 h-10"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Text Alignment</Label>
                  <select
                    value={newTypeData.textAlignment}
                    onChange={(e) => setNewTypeData({
                      ...newTypeData,
                      textAlignment: e.target.value as 'left' | 'center' | 'right'
                    })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Language</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="editLanguage"
                      checked={!newTypeData.isArabic}
                      onChange={() => setNewTypeData({ ...newTypeData, isArabic: false })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">English</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="editLanguage"
                      checked={newTypeData.isArabic}
                      onChange={() => setNewTypeData({ ...newTypeData, isArabic: true })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Arabic</span>
                  </label>
                </div>
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
              <Button onClick={handleUpdateType} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Update Type
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditTypeModalOpen(false);
                setEditingType(null);
                setNewTypeData({
                  title: '',
                  description: '',
                  content: '',
                  sections: [''],
                  iconImage: '',
                  backgroundImage: '',
                  textColor: '#000000',
                  textAlignment: 'left' as 'left' | 'center' | 'right',
                  isArabic: false
                });
              }} className="px-6">
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