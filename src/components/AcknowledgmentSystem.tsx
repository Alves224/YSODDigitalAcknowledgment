import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield, Laptop, Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface AcknowledgmentItem {
  id: string;
  type: string;
  employeeName: string;
  requestNo: string;
  date: string;
  acknowledged: boolean;
}

const acknowledgmentTypes = [
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
    id: 'remote-work',
    title: 'Remote Area Working Acknowledgement',
    description: 'أقرار التزام بتعليمات العمل في المناطق النائية',
    icon: Laptop,
    content: {
      arabic: 'أقرار التزام بتعليمات العمل في المناطق النائية',
      subtitle: 'Remote Area Working Acknowledgement',
      description: `أقر أنني تقدمت بطلب رسمي وإجباري يطلب الانتقال والعمل في المنطقة النائية بسكن إقامة وأن أي رفض لاحق حسب متطلبات المنطقة من قبل الشركة وعدم إدخال التعويلات المقررة من قبل الشركة ونم أنشطة الحفل وإدارة الأمن الصحي.

كما أنني أوافق على الشروط الواردة الخاصة بالعمل في المناطق النائية:`,
      rules: [
        'إستخدام الشكل المقرر من قبل شركة عليا قطر البيئة السويدي.',
        'إستخدام المؤهلات المقررة من قبل الشركة وعدم إستخدام التجمعات المركزية للعمل.',
        'الإلتزام وإتباع جميع التعليمات الآمنة وفق سياسات وأنظمة الشركة.'
      ]
    }
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
  const [formData, setFormData] = useState({
    requestNo: '',
    employeeName: '',
    acknowledged: false
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

  const selectedAck = acknowledgmentTypes.find(t => t.id === selectedType);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Digital Acknowledgment System
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the type of acknowledgment you need to complete
          </p>
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
                <CardHeader className="text-center">
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

                  <div className="text-right" dir="rtl">
                    <p className="font-semibold text-gray-800 mb-3">
                      كما أنني أوافق على الشروط الواردة الخاصة بالعمل في المناطق النائية:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-800">
                      {selectedAck.content.rules.map((rule, index) => (
                        <li key={index} className="leading-relaxed">
                          {rule}
                        </li>
                      ))}
                    </ol>
                  </div>
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
    </div>
  );
};