// SharePoint REST API Service
declare global {
  interface Window {
    _spPageContextInfo: {
      webAbsoluteUrl: string;
      userId: number;
      userEmail: string;
      userDisplayName: string;
    };
  }
}

export interface SharePointUser {
  Id: number;
  Title: string; // Email
  UserName: string;
  UserRole: string;
  Department?: string;
  Status: string;
}

export interface SharePointAcknowledgmentType {
  Id: number;
  Title: string;
  Description: string;
  Category: string;
  IsActive: boolean;
  CreatedBy: string;
  Created: string;
}

export interface SharePointSubmission {
  Id: number;
  Title: string;
  UserEmail: string;
  AcknowledgmentType: string;
  AcknowledgmentTypeId: number;
  SubmissionDate: string;
  Status: string;
  Comments?: string;
}

class SharePointService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = window._spPageContextInfo?.webAbsoluteUrl || '';
  }

  private async getRequestDigest(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/_api/contextinfo`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });
      const data = await response.json();
      return data.d.GetContextWebInformation.FormDigestValue;
    } catch (error) {
      console.error('Error getting request digest:', error);
      throw error;
    }
  }

  // Get current user from SharePoint context
  getCurrentUser(): { email: string; name: string } | null {
    if (window._spPageContextInfo) {
      return {
        email: window._spPageContextInfo.userEmail,
        name: window._spPageContextInfo.userDisplayName
      };
    }
    // Fallback for demo/development
    return {
      email: 'admin@company.com',
      name: 'Demo User'
    };
  }

  // Users List Operations
  async getUsers(): Promise<SharePointUser[]> {
    try {
      const response = await fetch(`${this.baseUrl}/_api/web/lists/getbytitle('Users')/items`, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      return data.d.results;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return mock data for demo
      return [
        { Id: 1, Title: 'admin@company.com', UserName: 'System Administrator', UserRole: 'Admin', Status: 'Active' },
        { Id: 2, Title: 'john.smith@company.com', UserName: 'John Smith', UserRole: 'User', Status: 'Active' },
        { Id: 3, Title: 'sarah.johnson@company.com', UserName: 'Sarah Johnson', UserRole: 'User', Status: 'Active' },
        { Id: 4, Title: 'mike.wilson@company.com', UserName: 'Mike Wilson', UserRole: 'Admin', Status: 'Active' }
      ];
    }
  }

  async getUserByEmail(email: string): Promise<SharePointUser | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => user.Title === email) || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Acknowledgment Types List Operations
  async getAcknowledgmentTypes(): Promise<SharePointAcknowledgmentType[]> {
    try {
      const response = await fetch(`${this.baseUrl}/_api/web/lists/getbytitle('Acknowledgment Types')/items?$filter=IsActive eq true`, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch acknowledgment types');
      }
      
      const data = await response.json();
      return data.d.results;
    } catch (error) {
      console.error('Error fetching acknowledgment types:', error);
      // Return mock data for demo
      return [
        {
          Id: 1,
          Title: 'Safety Training Completion',
          Description: 'I acknowledge that I have completed the mandatory safety training and understand all safety protocols.',
          Category: 'Safety',
          IsActive: true,
          CreatedBy: 'System',
          Created: new Date().toISOString()
        },
        {
          Id: 2,
          Title: 'Policy Review',
          Description: 'I acknowledge that I have read and understood the company policies and procedures.',
          Category: 'Compliance',
          IsActive: true,
          CreatedBy: 'System',
          Created: new Date().toISOString()
        },
        {
          Id: 3,
          Title: 'Equipment Received',
          Description: 'I acknowledge receipt of company equipment and understand my responsibility for its care.',
          Category: 'Equipment',
          IsActive: true,
          CreatedBy: 'System',
          Created: new Date().toISOString()
        }
      ];
    }
  }

  async createAcknowledgmentType(data: Omit<SharePointAcknowledgmentType, 'Id' | 'Created' | 'CreatedBy'>): Promise<SharePointAcknowledgmentType> {
    try {
      const digest = await this.getRequestDigest();
      const response = await fetch(`${this.baseUrl}/_api/web/lists/getbytitle('Acknowledgment Types')/items`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': digest
        },
        body: JSON.stringify({
          __metadata: { type: 'SP.Data.Acknowledgment_x0020_TypesListItem' },
          Title: data.Title,
          Description: data.Description,
          Category: data.Category,
          IsActive: data.IsActive
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create acknowledgment type');
      }

      const result = await response.json();
      return result.d;
    } catch (error) {
      console.error('Error creating acknowledgment type:', error);
      throw error;
    }
  }

  async updateAcknowledgmentType(id: number, data: Partial<SharePointAcknowledgmentType>): Promise<void> {
    try {
      const digest = await this.getRequestDigest();
      const response = await fetch(`${this.baseUrl}/_api/web/lists/getbytitle('Acknowledgment Types')/items(${id})`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': digest,
          'X-HTTP-Method': 'MERGE',
          'IF-MATCH': '*'
        },
        body: JSON.stringify({
          __metadata: { type: 'SP.Data.Acknowledgment_x0020_TypesListItem' },
          ...data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update acknowledgment type');
      }
    } catch (error) {
      console.error('Error updating acknowledgment type:', error);
      throw error;
    }
  }

  async deleteAcknowledgmentType(id: number): Promise<void> {
    try {
      const digest = await this.getRequestDigest();
      const response = await fetch(`${this.baseUrl}/_api/web/lists/getbytitle('Acknowledgment Types')/items(${id})`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'X-RequestDigest': digest,
          'X-HTTP-Method': 'DELETE',
          'IF-MATCH': '*'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete acknowledgment type');
      }
    } catch (error) {
      console.error('Error deleting acknowledgment type:', error);
      throw error;
    }
  }

  // Acknowledgment Submissions List Operations
  async getSubmissions(userEmail?: string): Promise<SharePointSubmission[]> {
    try {
      let url = `${this.baseUrl}/_api/web/lists/getbytitle('Acknowledgment Submissions')/items?$orderby=SubmissionDate desc`;
      
      if (userEmail) {
        url += `&$filter=UserEmail eq '${userEmail}'`;
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      return data.d.results;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // Return mock data for demo
      return [
        {
          Id: 1,
          Title: 'Safety Training - John Smith',
          UserEmail: 'john.smith@company.com',
          AcknowledgmentType: 'Safety Training Completion',
          AcknowledgmentTypeId: 1,
          SubmissionDate: new Date().toISOString(),
          Status: 'Submitted',
          Comments: 'Completed successfully'
        }
      ];
    }
  }

  async submitAcknowledgment(data: {
    acknowledgmentTypeId: number;
    acknowledgmentTypeName: string;
    userEmail: string;
    userName: string;
    comments?: string;
  }): Promise<SharePointSubmission> {
    try {
      const digest = await this.getRequestDigest();
      const response = await fetch(`${this.baseUrl}/_api/web/lists/getbytitle('Acknowledgment Submissions')/items`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': digest
        },
        body: JSON.stringify({
          __metadata: { type: 'SP.Data.Acknowledgment_x0020_SubmissionsListItem' },
          Title: `${data.acknowledgmentTypeName} - ${data.userName}`,
          UserEmail: data.userEmail,
          AcknowledgmentType: data.acknowledgmentTypeName,
          AcknowledgmentTypeId: data.acknowledgmentTypeId,
          SubmissionDate: new Date().toISOString(),
          Status: 'Submitted',
          Comments: data.comments || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit acknowledgment');
      }

      const result = await response.json();
      return result.d;
    } catch (error) {
      console.error('Error submitting acknowledgment:', error);
      throw error;
    }
  }
}

export const sharePointService = new SharePointService();