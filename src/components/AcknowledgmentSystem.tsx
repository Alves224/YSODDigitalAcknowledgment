import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, FileText, Users, Clock, CheckCircle } from 'lucide-react';

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
    id: 'safety',
    title: 'Safety Acknowledgment',
    description: 'Safety procedures and equipment usage',
    icon: Shield,
    color: 'bg-red-500'
  },
  {
    id: 'security',
    title: 'Security Equipment Check',
    description: 'Night shift security equipment verification',
    icon: Shield,
    color: 'bg-blue-500'
  },
  {
    id: 'remote-work',
    title: 'Remote Work Acknowledgment',
    description: 'Remote area working procedures',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    id: 'training',
    title: 'Training Completion',
    description: 'Training program acknowledgment',
    icon: FileText,
    color: 'bg-purple-500'
  }
];

export const AcknowledgmentSystem = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    requestNo: '',
    division: '',
    acknowledged: false
  });
  const [submissions, setSubmissions] = useState<AcknowledgmentItem[]>([]);
  const { toast } = useToast();

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({
      ...formData,
      requestNo: `REQ${Date.now()}`,
      employeeName: 'John Doe' // Simulated SharePoint integration
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.acknowledged) {
      toast({
        title: "Acknowledgment Required",
        description: "Please confirm that you have read and understood the procedures.",
        variant: "destructive"
      });
      return;
    }

    const newSubmission: AcknowledgmentItem = {
      id: Date.now().toString(),
      type: selectedType,
      employeeName: formData.employeeName,
      requestNo: formData.requestNo,
      date: new Date().toLocaleDateString(),
      acknowledged: formData.acknowledged
    };

    setSubmissions([...submissions, newSubmission]);
    setIsModalOpen(false);
    setFormData({
      employeeName: '',
      requestNo: '',
      division: '',
      acknowledged: false
    });

    toast({
      title: "Acknowledgment Submitted",
      description: "Your acknowledgment has been recorded successfully.",
      variant: "default"
    });
  };

  const selectedAckType = acknowledgmentTypes.find(type => type.id === selectedType);

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Digital Acknowledgment System
          </h1>
          <p className="text-white/80 text-lg">
            Secure • Monitor • Protect
          </p>
        </div>

        {/* Main Action */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="bg-gradient-card backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Ready to Transfer?</CardTitle>
              <p className="text-white/70">
                Choose your acknowledgment type to proceed
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {acknowledgmentTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    variant="glass"
                    className="w-full justify-start gap-3 h-auto p-4"
                  >
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">{type.title}</div>
                      <div className="text-sm text-white/70">{type.description}</div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Submissions</h2>
            <div className="grid gap-4">
              {submissions.map((submission) => {
                const type = acknowledgmentTypes.find(t => t.id === submission.type);
                const IconComponent = type?.icon || FileText;
                return (
                  <Card key={submission.id} className="bg-gradient-card backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${type?.color || 'bg-gray-500'}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{type?.title}</h3>
                            <p className="text-sm text-white/70">
                              {submission.employeeName} • {submission.requestNo}
                            </p>
                            <p className="text-sm text-white/50">{submission.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-success text-success-foreground">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Acknowledgment Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedAckType && (
                  <>
                    <div className={`p-2 rounded-lg ${selectedAckType.color}`}>
                      <selectedAckType.icon className="h-5 w-5 text-white" />
                    </div>
                    {selectedAckType.title}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Form Progress */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Form Progress</span>
                <span>1/3 fields completed</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-1/3"></div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="requestNo">Request No.</Label>
                  <Input
                    id="requestNo"
                    value={formData.requestNo}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    value={formData.employeeName}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Name retrieved from SharePoint
                  </p>
                </div>

                <div>
                  <Label htmlFor="division">Division</Label>
                  <Select value={formData.division} onValueChange={(value) => setFormData({...formData, division: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Security Operations</SelectItem>
                      <SelectItem value="safety">Safety Department</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Acknowledgment Text */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Acknowledgment Statement</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I acknowledge that I have read, understood, and agree to comply with all 
                    {selectedAckType?.title.toLowerCase()} procedures and policies. I understand 
                    my responsibilities and the importance of following these guidelines for the 
                    safety and security of all personnel and operations.
                  </p>
                </div>

                {/* Acknowledgment Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acknowledge"
                    checked={formData.acknowledged}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, acknowledged: checked as boolean})
                    }
                  />
                  <Label htmlFor="acknowledge" className="text-sm">
                    I acknowledge that I have read, understood and agree to the above policies and procedures
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                variant="gradient"
                size="lg"
              >
                Submit Acknowledgment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};