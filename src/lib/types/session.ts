export interface ActiveSession {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
  };
  loginTime: string;
  lastActivity: string;
  duration: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: any;
  location: any;
  isCurrentSession: boolean;
}

export interface SessionStats {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: string;
  peakConcurrentUsers: number;
  todayLogins: number;
  sessionsByRole: {
    role: string;
    count: number;
  }[];
}

export interface InactiveUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin: {
    date: string;
    daysAgo: number;
    loginTime: string;
    ipAddress: string;
  };
}
