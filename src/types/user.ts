export interface User {
  email: string;
  name: string;
  role: 'Admin' | 'Supervisor' | 'Employee';
  unit?: string;
  supervisorEmail?: string;
}

export interface SharePointAdminList {
  title: string; // UserName
  role: 'Admin';
}

export interface SharePointSupervisorList {
  employeeName: string;
  supervisorEmail: string;
  unit: string;
}

export interface SubmissionHistory {
  requestNo: string;
  employeeName: string;
  employeeEmail: string;
  supervisor: string;
  type: string;
  date: string;
  status: 'Pending' | 'Acknowledged' | 'Completed';
  submittedBy: string;
  unit?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  trigger: 'employee_submit' | 'supervisor_notify' | 'admin_notify' | 'confirmation';
}