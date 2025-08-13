'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Download, User, Phone, CreditCard, Calendar, RefreshCw, Filter, Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface DownloadLog {
  id: string;
  memberName: string;
  memberAccountNumber?: string;
  documentTitle: string;
  documentCategory: string;
  downloadType: 'CONTRACT' | 'COLLATERAL' | 'LOAN_APPLICATION' | 'GENERAL_FORM';
  phoneNumber?: string;
  loanAmount?: number;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
  verified: boolean;
  downloadedAt: string;
  document?: {
    title: string;
    category: string;
    originalName: string;
  };
}

interface DownloadStats {
  totalDownloads: number;
  verifiedDownloads: number;
  unverifiedDownloads: number;
  downloadsByType: Record<string, number>;
  downloadsByDocument: Record<string, number>;
  recentDownloads: DownloadLog[];
}

export default function DownloadLogsPage() {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDownloadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (dateFilter) queryParams.append('startDate', dateFilter);
      if (typeFilter && typeFilter !== 'all') queryParams.append('documentType', typeFilter);
      if (verifiedFilter && verifiedFilter !== 'all') queryParams.append('verified', verifiedFilter);

      const response = await apiClient.get(`/public-documents/stats/downloads?${queryParams}`);
      setStats(response.data.stats);
      setLogs(response.data.stats.recentDownloads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloadStats();
  }, [dateFilter, typeFilter, verifiedFilter]);

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return log.memberName.toLowerCase().includes(searchLower) ||
             log.documentTitle.toLowerCase().includes(searchLower) ||
             (log.memberAccountNumber && log.memberAccountNumber.toLowerCase().includes(searchLower));
    }
    return true;
  });

  const getDownloadTypeColor = (type: string) => {
    switch (type) {
      case 'LOAN_APPLICATION': return 'bg-blue-100 text-blue-800';
      case 'CONTRACT': return 'bg-green-100 text-green-800';
      case 'COLLATERAL': return 'bg-yellow-100 text-yellow-800';
      case 'GENERAL_FORM': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLocation = (location?: DownloadLog['location']) => {
    if (!location) return 'Unknown';
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading download logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchDownloadStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Download Logs</h1>
          <p className="text-gray-600 mt-1">Track document downloads and member activity</p>
        </div>
        <Button onClick={fetchDownloadStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalDownloads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verified Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verifiedDownloads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unverified Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unverifiedDownloads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verification Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalDownloads > 0 ? Math.round((stats.verifiedDownloads / stats.totalDownloads) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                placeholder="Search by name, document, account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LOAN_APPLICATION">Loan Application</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="COLLATERAL">Collateral</SelectItem>
                  <SelectItem value="GENERAL_FORM">General Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Verification Status</label>
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setTypeFilter('');
                  setVerifiedFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Recent Downloads ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Member</th>
                  <th className="text-left p-3 font-medium">Document</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Details</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Downloaded</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{log.memberName}</div>
                          {log.memberAccountNumber && (
                            <div className="text-sm text-gray-600">#{log.memberAccountNumber}</div>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant={log.verified ? "default" : "secondary"}>
                              {log.verified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{log.documentTitle}</div>
                        <div className="text-sm text-gray-600">{log.documentCategory}</div>
                      </div>
                    </td>
                    
                    <td className="p-3">
                      <Badge className={getDownloadTypeColor(log.downloadType)}>
                        {log.downloadType.replace('_', ' ')}
                      </Badge>
                    </td>
                    
                    <td className="p-3">
                      <div className="space-y-1">
                        {log.phoneNumber && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {log.phoneNumber}
                          </div>
                        )}
                        {log.loanAmount && (
                          <div className="flex items-center gap-1 text-sm">
                            <CreditCard className="w-3 h-3" />
                            TZS {log.loanAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {formatLocation(log.location)}
                      </div>
                      {log.ipAddress && (
                        <div className="text-xs text-gray-500 mt-1">{log.ipAddress}</div>
                      )}
                    </td>
                    
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span title={format(new Date(log.downloadedAt), 'PPP p')}>
                          {formatDistanceToNow(new Date(log.downloadedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No download logs found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Download by Type Chart */}
      {stats && Object.keys(stats.downloadsByType).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Downloads by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.downloadsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-32">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.totalDownloads) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Downloaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.downloadsByDocument)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([document, count]) => (
                  <div key={document} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{document}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-32">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.totalDownloads) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
