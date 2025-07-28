import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserData } from './AuthSystem';
import { sharePointService, SharePointAcknowledgmentType, SharePointSubmission } from '@/services/sharepoint';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Send, 
  CheckCircle, 
  Clock, 
  LogOut,
  Shield,
  User,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AcknowledgmentSystemProps {
  user: UserData;
  onLogout: () => void;
}

export const AcknowledgmentSystem = ({ user, onLogout }: AcknowledgmentSystemProps) => {
  const [acknowledgmentTypes, setAcknowledgmentTypes] = useState<SharePointAcknowledgmentType[]>([]);
  const [submissions, setSubmissions] = useState<SharePointSubmission[]>([]);
  const [selectedType, setSelectedType] = useState<SharePointAcknowledgmentType | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SharePointAcknowledgmentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [submitFormData, setSubmitFormData] = useState({
    comments: ''
  });

  const [newTypeFormData, setNewTypeFormData] = useState({
    title: '',
    description: '',
    category: '',
    isActive: true
  });

  const { toast } = useToast();

  // Load data from SharePoint on component mount
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadAcknowledgmentTypes(),
        loadSubmissions()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAcknowledgmentTypes = async () => {
    try {
      const types = await sharePointService.getAcknowledgmentTypes();
      setAcknowledgmentTypes(types);
    } catch (error) {
      console.error('Error loading acknowledgment types:', error);
      toast({
        title: "Error",
        description: "Failed to load acknowledgment types.",
        variant: "destructive"
      });
    }
  };

  const loadSubmissions = async () => {
    try {
      // Admin can see all submissions, users only see their own
      const userEmail = user.role === 'admin' ? undefined : user.email;
      const submissions = await sharePointService.getSubmissions(userEmail);
      setSubmissions(submissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitAcknowledgment = async () => {
    if (!selectedType) return;

    try {
      await sharePointService.submitAcknowledgment({
        acknowledgmentTypeId: selectedType.Id,
        acknowledgmentTypeName: selectedType.Title,
        userEmail: user.email,
        userName: user.name,
        comments: submitFormData.comments
      });

      toast({
        title: "Success",
        description: "Acknowledgment submitted successfully!"
      });

      setIsSubmitModalOpen(false);
      setSubmitFormData({ comments: '' });
      setSelectedType(null);
      await loadSubmissions();
    } catch (error) {
      console.error('Error submitting acknowledgment:', error);
      toast({
        title: "Error",
        description: "Failed to submit acknowledgment.",
        variant: "destructive"
      });
    }
  };

  const handleAddNewType = async () => {
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can add acknowledgment types.",
        variant: "destructive"
      });
      return;
    }

    if (!newTypeFormData.title || !newTypeFormData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await sharePointService.createAcknowledgmentType({
        Title: newTypeFormData.title,
        Description: newTypeFormData.description,
        Category: newTypeFormData.category,
        IsActive: newTypeFormData.isActive
      });

      toast({
        title: "Success",
        description: "Acknowledgment type created successfully!"
      });

      setIsAddTypeModalOpen(false);
      setNewTypeFormData({ title: '', description: '', category: '', isActive: true });
      await loadAcknowledgmentTypes();
    } catch (error) {
      console.error('Error creating acknowledgment type:', error);
      toast({
        title: "Error",
        description: "Failed to create acknowledgment type.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateType = async () => {
    if (!editingType || user.role !== 'admin') return;

    try {
      await sharePointService.updateAcknowledgmentType(editingType.Id, {
        Title: newTypeFormData.title,
        Description: newTypeFormData.description,
        Category: newTypeFormData.category,
        IsActive: newTypeFormData.isActive
      });

      toast({
        title: "Success",
        description: "Acknowledgment type updated successfully!"
      });

      setIsEditTypeModalOpen(false);
      setEditingType(null);
      setNewTypeFormData({ title: '', description: '', category: '', isActive: true });
      await loadAcknowledgmentTypes();
    } catch (error) {
      console.error('Error updating acknowledgment type:', error);
      toast({
        title: "Error",
        description: "Failed to update acknowledgment type.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteType = async (typeId: number) => {
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete acknowledgment types.",
        variant: "destructive"
      });
      return;
    }

    try {
      await sharePointService.deleteAcknowledgmentType(typeId);
      
      toast({
        title: "Success",
        description: "Acknowledgment type deleted successfully!"
      });

      await loadAcknowledgmentTypes();
    } catch (error) {
      console.error('Error deleting acknowledgment type:', error);
      toast({
        title: "Error",
        description: "Failed to delete acknowledgment type.",
        variant: "destructive"
      });
    }
  };

  const handleEditType = (type: SharePointAcknowledgmentType) => {
    setEditingType(type);
    setNewTypeFormData({
      title: type.Title,
      description: type.Description,
      category: type.Category,
      isActive: type.IsActive
    });
    setIsEditTypeModalOpen(true);
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.AcknowledgmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-elegant">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium">Loading from SharePoint...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Fetching acknowledgment types and submissions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-accent to-primary rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              YSOD Digital Acknowledgment Hub
            </h1>
            <p className="text-muted-foreground text-lg">
              {user.role === 'admin' 
                ? 'Manage acknowledgment types and monitor submissions'
                : 'Submit acknowledgments and view your history'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                <span className="font-medium">{user.name}</span>
              </div>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </Badge>
            </div>
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="acknowledgments" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="acknowledgments">Acknowledgment Types</TabsTrigger>
            <TabsTrigger value="submissions">Submission History</TabsTrigger>
          </TabsList>

          {/* Acknowledgment Types Tab */}
          <TabsContent value="acknowledgments" className="space-y-6">
            {user.role === 'admin' && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setIsAddTypeModalOpen(true)}
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Type
                </Button>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {acknowledgmentTypes.map((type) => (
                <Card 
                  key={type.Id} 
                  className="border hover:shadow-elegant transition-all duration-300 bg-card/50 backdrop-blur-sm hover:bg-card/80 group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{type.Title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{type.Description}</p>
                        <Badge variant="outline" className="mt-2">{type.Category}</Badge>
                      </div>
                      <FileText className="w-8 h-8 text-primary opacity-60" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedType(type);
                          setIsSubmitModalOpen(true);
                        }}
                        className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                      {user.role === 'admin' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditType(type)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteType(type.Id)}
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <Card className="p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No submissions found</p>
                  <p className="text-muted-foreground">
                    {user.role === 'admin' 
                      ? 'No acknowledgment submissions have been made yet.'
                      : 'You haven\'t submitted any acknowledgments yet.'
                    }
                  </p>
                </Card>
              ) : (
                filteredSubmissions.map((submission) => (
                  <Card key={submission.Id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <h3 className="font-semibold">{submission.AcknowledgmentType}</h3>
                          <Badge variant="outline">{submission.Status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Submitted by:</span> {submission.UserEmail}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(submission.SubmissionDate).toLocaleDateString()}
                          </div>
                        </div>
                        {submission.Comments && (
                          <p className="mt-2 text-sm bg-muted/50 p-2 rounded">
                            <span className="font-medium">Comments:</span> {submission.Comments}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Acknowledgment Modal */}
        <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Acknowledgment</DialogTitle>
            </DialogHeader>
            {selectedType && (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedType.Title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedType.Description}</p>
                  <Badge variant="outline" className="mt-2">{selectedType.Category}</Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Add any additional comments..."
                      value={submitFormData.comments}
                      onChange={(e) => setSubmitFormData({ comments: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSubmitModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitAcknowledgment}
                    className="bg-gradient-primary hover:opacity-90 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Acknowledgment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add New Type Modal */}
        <Dialog open={isAddTypeModalOpen} onOpenChange={setIsAddTypeModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Acknowledgment Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTypeFormData.title}
                  onChange={(e) => setNewTypeFormData({ ...newTypeFormData, title: e.target.value })}
                  placeholder="Enter acknowledgment title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTypeFormData.description}
                  onChange={(e) => setNewTypeFormData({ ...newTypeFormData, description: e.target.value })}
                  placeholder="Enter acknowledgment description"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newTypeFormData.category}
                  onChange={(e) => setNewTypeFormData({ ...newTypeFormData, category: e.target.value })}
                  placeholder="Enter category (e.g., Safety, Compliance)"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsAddTypeModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewType} className="bg-gradient-primary hover:opacity-90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Type Modal */}
        <Dialog open={isEditTypeModalOpen} onOpenChange={setIsEditTypeModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Acknowledgment Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={newTypeFormData.title}
                  onChange={(e) => setNewTypeFormData({ ...newTypeFormData, title: e.target.value })}
                  placeholder="Enter acknowledgment title"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newTypeFormData.description}
                  onChange={(e) => setNewTypeFormData({ ...newTypeFormData, description: e.target.value })}
                  placeholder="Enter acknowledgment description"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={newTypeFormData.category}
                  onChange={(e) => setNewTypeFormData({ ...newTypeFormData, category: e.target.value })}
                  placeholder="Enter category (e.g., Safety, Compliance)"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsEditTypeModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateType} className="bg-gradient-primary hover:opacity-90 text-white">
                <Edit3 className="w-4 h-4 mr-2" />
                Update Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};