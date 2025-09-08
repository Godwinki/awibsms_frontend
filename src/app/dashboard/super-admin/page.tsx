'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Shield, 
  Unlock, 
  Eye, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import apiClient from '@/lib/axios';
import { withRoleProtection } from '@/components/auth/withRoleProtection';

interface LockedSuperAdmin {
  id: string;
  email: string;
  name: string;
  lockoutUntil: string;
  failedLoginAttempts: number;
  lastFailedLogin: string;
}

interface SecurityStatus {
  securityLevel: 'GOOD' | 'WARNING' | 'CRITICAL';
  warnings: string[];
  summary: {
    total: number;
    active: number;
    locked: number;
    disabled: number;
  };
  recommendations: string[];
}

function SuperAdminManagementPage() {
  const [lockedSuperAdmins, setLockedSuperAdmins] = useState<LockedSuperAdmin[]>([]);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockLoading, setUnlockLoading] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<LockedSuperAdmin | null>(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [lockedResponse, securityResponse] = await Promise.all([
        apiClient.get('/auth/super-admin/locked'),
        apiClient.get('/auth/super-admin/security-status')
      ]);

      setLockedSuperAdmins(lockedResponse.data.data.lockedSuperAdmins);
      setSecurityStatus(securityResponse.data.data);
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

  const handleUnlockRequest = (admin: LockedSuperAdmin) => {
    setSelectedAdmin(admin);
    setUnlockReason('');
    setShowUnlockDialog(true);
  };

  const handleUnlockConfirm = async () => {
    if (!selectedAdmin || !unlockReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for unlocking this account",
        variant: "destructive",
      });
      return;
    }

    if (unlockReason.trim().length < 10) {
      toast({
        title: "Error",
        description: "Reason must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setUnlockLoading(selectedAdmin.id);
      
      await apiClient.post('/auth/super-admin/unlock', {
        targetEmail: selectedAdmin.email,
        reason: unlockReason.trim()
      });

      toast({
        title: "Success",
        description: `Super admin account ${selectedAdmin.email} has been unlocked`,
      });

      setShowUnlockDialog(false);
      setSelectedAdmin(null);
      setUnlockReason('');
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unlock account",
        variant: "destructive",
      });
    } finally {
      setUnlockLoading(null);
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'GOOD': return 'text-green-600 bg-green-50 border-green-200';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'GOOD': return <CheckCircle className="h-5 w-5" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5" />;
      case 'CRITICAL': return <AlertCircle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading super admin management data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Management</h1>
        <p className="text-gray-600 mt-2">
          Manage locked super admin accounts and monitor security status
        </p>
      </div>

      {/* Security Status Card */}
      {securityStatus && (
        <Card className={`border-2 ${getSecurityLevelColor(securityStatus.securityLevel)}`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {getSecurityIcon(securityStatus.securityLevel)}
              <CardTitle>Security Status: {securityStatus.securityLevel}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{securityStatus.summary.total}</div>
                <div className="text-sm text-gray-600">Total Super Admins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{securityStatus.summary.active}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{securityStatus.summary.locked}</div>
                <div className="text-sm text-gray-600">Locked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{securityStatus.summary.disabled}</div>
                <div className="text-sm text-gray-600">Disabled</div>
              </div>
            </div>

            {securityStatus.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Warnings:</h4>
                {securityStatus.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                    <span className="text-sm">{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {securityStatus.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations:</h4>
                {securityStatus.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 mt-0.5 text-blue-500" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Locked Super Admin Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Locked Super Admin Accounts</span>
            <Badge variant="secondary">{lockedSuperAdmins.length}</Badge>
          </CardTitle>
          <CardDescription>
            Super admin accounts that are currently locked and need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lockedSuperAdmins.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Locked Super Admin Accounts</h3>
              <p className="text-gray-600">All super admin accounts are currently unlocked.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lockedSuperAdmins.map((admin) => (
                <div key={admin.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{admin.name}</div>
                      <div className="text-sm text-gray-600">{admin.email}</div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Locked until: {new Date(admin.lockoutUntil).toLocaleString()}</span>
                        </div>
                        <div>Failed attempts: {admin.failedLoginAttempts}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUnlockRequest(admin)}
                      disabled={unlockLoading === admin.id}
                      className="flex items-center space-x-2"
                    >
                      <Unlock className="h-4 w-4" />
                      <span>{unlockLoading === admin.id ? 'Unlocking...' : 'Unlock'}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unlock Confirmation Dialog */}
      {showUnlockDialog && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Unlock className="h-5 w-5" />
                <span>Unlock Super Admin Account</span>
              </CardTitle>
              <CardDescription>
                You are about to unlock {selectedAdmin.name} ({selectedAdmin.email})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is a critical security action. The account will be unlocked immediately and the user will be forced to change their password on next login.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="unlock-reason">Reason for unlocking (required)</Label>
                <Textarea
                  id="unlock-reason"
                  placeholder="Enter detailed reason for unlocking this super admin account..."
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  rows={3}
                />
                <div className="text-sm text-gray-500">
                  Minimum 10 characters. This will be logged for audit purposes.
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUnlockDialog(false);
                    setSelectedAdmin(null);
                    setUnlockReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnlockConfirm}
                  disabled={!unlockReason.trim() || unlockReason.trim().length < 10 || unlockLoading === selectedAdmin.id}
                  className="flex-1"
                >
                  {unlockLoading === selectedAdmin.id ? 'Unlocking...' : 'Confirm Unlock'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default withRoleProtection(SuperAdminManagementPage, ['super_admin']);
