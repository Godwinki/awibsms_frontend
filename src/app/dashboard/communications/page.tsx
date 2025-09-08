"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Users, 
  Send, 
  Wallet, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import communicationsService, { SMSStats, SmsBalance } from '@/lib/services/communications.service';
import { toast } from "sonner";

interface DashboardStats {
  totalGroups: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalSent: number;
  balance: number;
}

export default function CommunicationsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSent: 0,
    balance: 0
  });
  const [smsStats, setSmsStats] = useState<SMSStats | null>(null);
  const [balance, setBalance] = useState<SmsBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch SMS statistics
      const smsStatsData = await communicationsService.getSMSStats();
      setSmsStats(smsStatsData);

      // Fetch current balance
      const balanceData = await communicationsService.getCurrentBalance();
      setBalance(balanceData);

      // Fetch other stats (simplified for now)
      const groupsData = await communicationsService.getContactGroups(1, 1);
      const campaignsData = await communicationsService.getCampaigns(1, 1);

      setStats({
        totalGroups: groupsData?.total || 0,
        totalCampaigns: campaignsData?.total || 0,
        activeCampaigns: 0, // TODO: Filter active campaigns
        totalSent: smsStatsData?.totalSent || 0,
        balance: balanceData?.currentBalance || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 1000) return "text-green-600";
    if (balance > 100) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">
            Manage SMS messaging, contact groups, and campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/communications/sms">
              <Send className="h-4 w-4 mr-2" />
              Send SMS
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/communications/campaigns">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceColor(stats.balance)}`}>
              TSh {(stats.balance || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance?.currency || 'TZS'} balance remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SMS Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalSent || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {smsStats?.todayStats?.sent || 0} sent today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Active contact groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getDeliveryRateColor(smsStats?.deliveryRate || 0)}`}>
              {(smsStats?.deliveryRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall delivery rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common communication tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/communications/sms">
                <Send className="h-4 w-4 mr-2" />
                Send Individual SMS
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/communications/campaigns">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create Bulk Campaign
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/communications/groups">
                <Users className="h-4 w-4 mr-2" />
                Manage Contact Groups
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/communications/balance">
                <Wallet className="h-4 w-4 mr-2" />
                Check Balance & Usage
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Performance</CardTitle>
            <CardDescription>
              SMS statistics for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Delivered</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                {smsStats?.todayStats?.delivered || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Sent</span>
              </div>
              <Badge variant="outline" className="text-yellow-600">
                {smsStats?.todayStats?.sent || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Failed</span>
              </div>
              <Badge variant="outline" className="text-red-600">
                {smsStats?.todayStats?.failed || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Today's Cost</span>
              </div>
              <Badge variant="outline" className="text-blue-600">
                TSh {(smsStats?.todayStats?.cost || 0).toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/communications/sms">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                SMS Messages
              </CardTitle>
              <CardDescription>
                Send individual messages and view history
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/communications/campaigns">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Campaigns
              </CardTitle>
              <CardDescription>
                Create and manage bulk SMS campaigns
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/communications/groups">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contact Groups
              </CardTitle>
              <CardDescription>
                Organize members into contact groups
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/communications/balance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Balance & Usage
              </CardTitle>
              <CardDescription>
                Monitor SMS balance and usage statistics
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
