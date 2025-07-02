export interface Intern {
  id: string;
  uniqueId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  photo: string; // Google Drive file ID or URL
  linkedinProfile: string;
  internshipFields: InternshipField[];
  totalOfflineWeeks: number;
  totalOnlineWeeks: number;
  certificateIssued: boolean;
  createdAt: string;
}

export interface InternshipField {
  id: string;
  fieldName: string;
  startDate: string;
  endDate?: string; // Optional when not completed
  duration?: string; // Auto-calculated when completed
  type: 'online' | 'offline';
  projectLinks: string[];
  videoLinks: string[];
  description: string;
  completed: boolean; // New field to track completion status
  completedDate?: string; // When the field was marked as completed
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string;
  apiKey: string;
}