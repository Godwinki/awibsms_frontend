'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Monitor, 
  Clock, 
  MapPin, 
  Smartphone, 
  LogOut,
  AlertTriangle,
  Eye,
  Search,
  Filter,
  BarChart3,
  UserX,
  Power,
  Activity
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import apiClient from '@/lib/axios';
import { withRoleProtection } from '@/components/auth/withRoleProtection';
import SessionTerminationDialog from '@/components/admin/sessions/SessionTerminationDialog';

interface ActiveSession {
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

interface InactiveUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin: string | null;
  daysSinceLastLogin: number | string;
  accountAge: number;
  hasActiveSession: boolean;
}

interface SessionStats {
  overview: {
    activeSessions: number;
    uniqueActiveUsers: number;
    sessionsLast24h: number;
    sessionsLastWeek: number;
    averageSessionDuration: number;
  };
  sessionsByRole: Record<string, number>;
  recentActivity: Array<{
    user: {
      name: string;
      email: string;
      role: string;
    };
    loginTime: string;
    ipAddress: string;
  }>;
}

function SessionManagementPage() {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active-sessions');
  
  // Dialog states
  const [terminationDialog, setTerminationDialog] = useState({
    isOpen: false,
    session: null as ActiveSession | null,
    isLoading: false
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inactiveDays, setInactiveDays] = useState('30');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, roleFilter, inactiveDays, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'active-sessions') {
        await fetchActiveSessions();
        await fetchSessionStats();
      } else if (activeTab === 'inactive-users') {
        await fetchInactiveUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '20',
      ...(roleFilter !== 'all' && { role: roleFilter }),
      ...(searchTerm && { search: searchTerm })
    });

    const response = await apiClient.get(`/system/sessions/active?${params}`);
    setActiveSessions(response.data.data.sessions);
    setTotalPages(response.data.data.pagination.pages);
  };

  const fetchInactiveUsers = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '20',
      days: inactiveDays,
      ...(roleFilter !== 'all' && { role: roleFilter })
    });

    const response = await apiClient.get(`/system/sessions/inactive-users?${params}`);
    setInactiveUsers(response.data.data.inactiveUsers);
    setTotalPages(response.data.data.pagination.pages);
  };

  const fetchSessionStats = async () => {
    const response = await apiClient.get('/system/sessions/stats');
    setSessionStats(response.data.data);
  };

  const handleTerminateSession = async (sessionId: string, reason: string) => {
    setTerminationDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await apiClient.delete(`/system/sessions/${sessionId}`, {
        data: { reason }
      });
      
      toast({
        title: "Success",
        description: "Session terminated successfully",
      });
      
      await fetchActiveSessions();
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.response?.data?.message || "Failed to terminate session",
        variant: "destructive",
      });
      throw error; // Re-throw to be handled by dialog
    } finally {
      setTerminationDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const openTerminationDialog = (session: ActiveSession) => {
    setTerminationDialog({
      isOpen: true,
      session: session,
      isLoading: false
    });
  };

  const closeTerminationDialog = () => {
    setTerminationDialog({
      isOpen: false,
      session: null,
      isLoading: false
    });
  };

  const handleTerminateAllUserSessions = async (userId: string) => {
    try {
      await apiClient.delete(`/system/sessions/user/${userId}/terminate-all`);
      toast({
        title: "Success",
        description: "All user sessions terminated successfully",
      });
      fetchActiveSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to terminate user sessions",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-purple-100 text-purple-800',
      'manager': 'bg-blue-100 text-blue-800',
      'accountant': 'bg-green-100 text-green-800',
      'it': 'bg-orange-100 text-orange-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.default;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent?.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Session Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor active user sessions and track user activity
        </p>
      </div>

      {/* Session Statistics Cards */}
      {sessionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{sessionStats.overview.activeSessions}</p>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{sessionStats.overview.uniqueActiveUsers}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{sessionStats.overview.averageSessionDuration}m</p>
                  <p className="text-sm text-gray-600">Avg. Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{sessionStats.overview.sessionsLast24h}</p>
                  <p className="text-sm text-gray-600">Last 24h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active-sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="inactive-users">Inactive Users</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="clerk">Clerk</SelectItem>
            </SelectContent>
          </Select>

          {activeTab === 'inactive-users' && (
            <Select value={inactiveDays} onValueChange={setInactiveDays}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Inactive period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="active-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Active Sessions</span>
                <Badge variant="secondary">{activeSessions.length}</Badge>
              </CardTitle>
              <CardDescription>
                Currently logged-in users and their session details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : activeSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No Active Sessions</h3>
                  <p className="text-gray-600">No users are currently logged in.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium">{session.user.name}</div>
                            <Badge className={getRoleColor(session.user.role)}>
                              {session.user.role}
                            </Badge>
                            {session.isCurrentSession && (
                              <Badge variant="outline">Current Session</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{session.user.email}</div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Duration: {session.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getDeviceIcon(session.userAgent)}
                              <span>IP: {session.ipAddress}</span>
                            </div>
                            <div>
                              Last activity: {formatTimeAgo(session.lastActivity)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTerminateAllUserSessions(session.userId)}
                            disabled={session.isCurrentSession}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Terminate All
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openTerminationDialog(session)}
                            disabled={session.isCurrentSession}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Terminate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserX className="h-5 w-5" />
                <span>Inactive Users</span>
                <Badge variant="secondary">{inactiveUsers.length}</Badge>
              </CardTitle>
              <CardDescription>
                Users who haven't logged in recently (last {inactiveDays} days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : inactiveUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No Inactive Users</h3>
                  <p className="text-gray-600">All users have been active recently.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inactiveUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium">{user.name}</div>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                            {user.hasActiveSession && (
                              <Badge variant="outline" className="text-green-600">
                                Currently Online
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div>
                              Last login: {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleDateString()
                                : 'Never'
                              }
                            </div>
                            <div>
                              Inactive for: {user.daysSinceLastLogin === 'Never' 
                                ? 'Never logged in' 
                                : `${user.daysSinceLastLogin} days`
                              }
                            </div>
                            <div>Account age: {user.accountAge} days</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Session Termination Dialog */}
      <SessionTerminationDialog
        isOpen={terminationDialog.isOpen}
        onClose={closeTerminationDialog}
        onConfirm={handleTerminateSession}
        session={terminationDialog.session}
        isLoading={terminationDialog.isLoading}
      />
    </div>
  );
}

export default withRoleProtection(SessionManagementPage, ['admin', 'super_admin', 'it']);
