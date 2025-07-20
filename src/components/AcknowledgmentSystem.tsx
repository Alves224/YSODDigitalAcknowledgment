import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield, Laptop, Users, AlertTriangle, CheckCircle, Plus, Trash2, Download } from 'lucide-react';
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
  content?: {
    arabic?: string;
    subtitle?: string;
    description?: string;
    rules?: string[];
  };
}

const defaultAcknowledgmentTypes: AcknowledgmentType[] = [
  {
    id: 'remote-work',
    title: 'Remote Area Working Acknowledgement',
    description: 'إقرار إلتزام بتعليمات العمل في المناطق النائية',
    icon: Laptop,
    content: {
      arabic: 'إقرار إلتزام بتعليمات العمل في المناطق النائية',
      subtitle: 'Remote Area Working Acknowledgement',
      description: `أقر بأنني تقدمت بناءاً على رغبتي واختياري بطلب الأنتقال للعمل في المنطقة النائية لمدة سنتين او في اي وقت يحدد حسب مايتطلبه العمل إستناداً إلى أنظمة التنقل في إدارة الأمن الصناعي

كما أنني أوافق على الشروط الواردة أدناه الخاصة بالعمل في المناطق النائية:-`,
      rules: [
        'إستخدام السكن الموفر من قبل الشركة طيلة فترة النوبة الأسبوعية.',
        'إستخدام المواصلات الموفرة من قبل الشركة وعدم إستخدام المركبة الشخصية للتنقل للعمل',
        'الإلتزام واتباع جميع أنظمة وتعليمات السلامة وفق سياسات وأنظمة الشركة.'
      ]
    }
  },
  {
    id: 'transfer',
    title: 'Transfer Acknowledgment',
    description: 'Acknowledge transfer policies and procedures',
    icon: FileText,
  },
  {
    id: 'safety',
    title: 'Safety Acknowledgment', 
    description: 'Acknowledge safety protocols and guidelines',
    icon: Shield,
  },
  {
    id: 'security',
    title: 'Security Acknowledgment',
    description: 'Acknowledge security policies and data protection',
    icon: AlertTriangle,
  },
  {
    id: 'training',
    title: 'Training Acknowledgment',
    description: 'Acknowledge completion of mandatory training',
    icon: Users,
  }
];

export const AcknowledgmentSystem = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
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
    sections: ['']
  });
  const [submissions, setSubmissions] = useState<AcknowledgmentItem[]>([]);
  const { toast } = useToast();

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
        variant: "destructive",
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
      description: "Your acknowledgment has been successfully recorded.",
    });
  };

  const handleAddNewType = () => {
    if (!newTypeData.title || !newTypeData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
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
    setNewTypeData({ title: '', description: '', content: '', sections: [''] });
    setIsAddTypeModalOpen(false);

    toast({
      title: "Acknowledgment Type Added",
      description: "New acknowledgment type has been created successfully.",
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
      description: "Acknowledgment type has been deleted successfully.",
    });
  };

  const exportToPDF = () => {
    if (!selectedAck || !formData.employeeName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before exporting.",
        variant: "destructive",
      });
      return;
    }

    const pdf = new jsPDF();
    
    // Set font
    pdf.setFont('helvetica', 'normal');
    
    // Title
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text('YSOD Digital Acknowledgment Form', 20, 30);
    
    // Acknowledgment type
    pdf.setFontSize(16);
    pdf.text(selectedAck.title, 20, 50);
    
    // Request details
    pdf.setFontSize(12);
    pdf.text(`Request No: ${formData.requestNo}`, 20, 70);
    pdf.text(`Employee Name: ${formData.employeeName}`, 20, 85);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 100);
    
    // Content
    if (selectedAck.content?.description) {
      pdf.setFontSize(14);
      pdf.text('Content:', 20, 125);
      pdf.setFontSize(11);
      const splitDescription = pdf.splitTextToSize(selectedAck.content.description, 170);
      pdf.text(splitDescription, 20, 140);
      
      // Rules
      if (selectedAck.content.rules && selectedAck.content.rules.length > 0) {
        let yPosition = 140 + (splitDescription.length * 6) + 20;
        pdf.setFontSize(14);
        pdf.text('Rules and Procedures:', 20, yPosition);
        
        selectedAck.content.rules.forEach((rule, index) => {
          yPosition += 15;
          pdf.setFontSize(11);
          const splitRule = pdf.splitTextToSize(`${index + 1}. ${rule}`, 170);
          pdf.text(splitRule, 25, yPosition);
          yPosition += (splitRule.length - 1) * 6;
        });
      }
    }
    
    // Acknowledgment statement
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(12);
    pdf.text('Acknowledgment:', 20, pageHeight - 60);
    pdf.setFontSize(11);
    pdf.text('I acknowledge that I have read, understood and agree to the above policies and procedures.', 20, pageHeight - 45);
    
    // Status
    pdf.setFontSize(12);
    pdf.setTextColor(0, 150, 0);
    pdf.text('Status: Acknowledged ✓', 20, pageHeight - 25);
    
    // Save the PDF
    pdf.save(`acknowledgment_${formData.requestNo}_${formData.employeeName.replace(/\s+/g, '_')}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Acknowledgment form has been exported as PDF.",
    });
  };

  const selectedAck = acknowledgmentTypes.find(t => t.id === selectedType);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            YSOD Digital Acknowledgment Form Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the type of acknowledgment you need to complete
          </p>
        </div>

        {/* Add New Type Button */}
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setIsAddTypeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Acknowledgment Type
          </Button>
        </div>

        {/* Acknowledgment Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {acknowledgmentTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id} 
                className="border hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
                onClick={() => handleTypeSelect(type.id)}
              >
                <CardHeader className="text-center relative">
                  {type.id.startsWith('custom-') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteType(type.id);
                      }}
                    >
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
              </Card>
            );
          })}
        </div>

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Acknowledgment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="bg-white p-8 space-y-6">
            {selectedAck?.id === 'remote-work' && selectedAck.content ? (
              <>
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

                   {selectedAck.content.rules && (
                     <div className="text-right" dir="rtl">
                       <ol className="list-decimal list-inside space-y-2 text-gray-800">
                         {selectedAck.content.rules.map((rule, index) => (
                           <li key={index} className="leading-relaxed">
                             {rule}
                           </li>
                         ))}
                       </ol>
                     </div>
                   )}
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
                        <Input
                          value={formData.requestNo}
                          onChange={(e) => setFormData({...formData, requestNo: e.target.value})}
                          className="border-gray-300"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label className="text-sm font-medium text-gray-700">Employee Name:</Label>
                      <div className="col-span-2">
                        <Input
                          value={formData.employeeName}
                          onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                          className="border-gray-300"
                          placeholder="Enter employee name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 items-start gap-4">
                      <Label className="text-sm font-medium text-gray-700">Acknowledgment *</Label>
                      <div className="col-span-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            checked={formData.acknowledged}
                            onCheckedChange={(checked) => 
                              setFormData({...formData, acknowledged: checked as boolean})
                            }
                            className="mt-1"
                          />
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
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                  >
                    Submit
                  </Button>
                  <Button 
                    onClick={exportToPDF} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsModalOpen(false)}
                    className="bg-red-600 hover:bg-red-700 px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedAck?.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Content */}
                  {selectedAck?.content?.description && (
                    <div className="text-right" dir="rtl">
                      <p className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
                        {selectedAck.content.description}
                      </p>
                    </div>
                  )}

                  {/* Numbered Rules */}
                  {selectedAck?.content?.rules && selectedAck.content.rules.length > 0 && (
                    <div className="text-right" dir="rtl">
                      <ol className="list-decimal list-inside space-y-2 text-gray-800">
                        {selectedAck.content.rules.map((rule, index) => (
                          <li key={index} className="leading-relaxed">
                            {rule}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

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
                          <Input
                            value={formData.requestNo}
                            onChange={(e) => setFormData({...formData, requestNo: e.target.value})}
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-sm font-medium text-gray-700">Employee Name:</Label>
                        <div className="col-span-2">
                          <Input
                            value={formData.employeeName}
                            onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                            className="border-gray-300"
                            placeholder="Enter employee name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 items-start gap-4">
                        <Label className="text-sm font-medium text-gray-700">Acknowledgment *</Label>
                        <div className="col-span-2">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              checked={formData.acknowledged}
                              onCheckedChange={(checked) => 
                                setFormData({...formData, acknowledged: checked as boolean})
                              }
                              className="mt-1"
                            />
                            <label className="text-sm text-gray-700 leading-relaxed">
                              I acknowledge that I have read, understood and agree to the above policies and procedures
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSubmit} 
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                      Submit
                    </Button>
                    <Button 
                      onClick={exportToPDF} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsModalOpen(false)}
                      className="bg-red-600 hover:bg-red-700 px-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
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
                <Input
                  value={newTypeData.title}
                  onChange={(e) => setNewTypeData({...newTypeData, title: e.target.value})}
                  placeholder="Enter acknowledgment title"
                  className="border-gray-300"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description *</Label>
                <Input
                  value={newTypeData.description}
                  onChange={(e) => setNewTypeData({...newTypeData, description: e.target.value})}
                  placeholder="Enter brief description"
                  className="border-gray-300"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Content (Optional)</Label>
                <Textarea
                  value={newTypeData.content}
                  onChange={(e) => setNewTypeData({...newTypeData, content: e.target.value})}
                  placeholder="Enter detailed acknowledgment content"
                  className="border-gray-300 min-h-[120px]"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Numbered Sections/Rules (Optional)</Label>
                <div className="space-y-3">
                  {newTypeData.sections.map((section, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-sm text-gray-500 mt-2 min-w-[20px]">{index + 1}.</span>
                      <Textarea
                        value={section}
                        onChange={(e) => updateSection(index, e.target.value)}
                        placeholder={`Enter section ${index + 1} content`}
                        className="border-gray-300 flex-1"
                        rows={2}
                      />
                      {newTypeData.sections.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSection(index)}
                          className="mt-1 text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSection}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleAddNewType} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                Add Type
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddTypeModalOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};