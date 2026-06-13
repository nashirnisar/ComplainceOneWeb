export type UserType = 'Individual' | 'Freelancer' | 'Startup' | 'Business';

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

export interface BusinessInfo {
  companyName: string;
  registrationDate: string;
  businessType: string;
  gstNumber?: string;
  pan?: string;
  cin?: string;
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  userType: UserType;
  businessInfo?: BusinessInfo;
  isOnboarded: boolean;
}

export type ComplianceStatus = 'Pending' | 'Completed' | 'Overdue';
export type CompliancePriority = 'Low' | 'Medium' | 'High';

export interface ComplianceTask {
  id: string;
  name: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  status: ComplianceStatus;
  priority: CompliancePriority;
  penalty: string;
  risks: string;
  guidanceSteps: string[];
  completedDate?: string;
  category: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Startup' | 'Tax' | 'Regulation' | 'Compliance';
  summary: string;
  date: string;
  source: string;
}

export interface NotificationItem {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'alert' | 'update' | 'system';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
