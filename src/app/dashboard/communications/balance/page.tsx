"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  RefreshCw,
  Plus,
  Download,
  Calendar,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import communicationsService, { 
  SmsBalance, 
  BalanceHistory, 
  BalanceStats 
} from '@/lib/services/communications.service';
import { toast } from "sonner";

export default function BalancePage() {
  const [balance, setBalance] = useState<SmsBalance | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);
  const [balanceStats, setBalanceStats] = useState<BalanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialog states
  const [updateBalanceDialogOpen, setUpdateBalanceDialogOpen] = useState(false);
  const [updateAmount, setUpdateAmount] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");

  useEffect(() => {
    fetchBalanceData();
  }, [page]);

  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch current balance
      const balanceData = await communicationsService.getCurrentBalance();
      setBalance(balanceData);

      // Fetch balance history
      const historyData = await communicationsService.getBalanceHistory(page, 10);
      setBalanceHistory(historyData.history);
      setTotalPages(historyData.totalPages);

      // Fetch balance statistics
      const statsData = await communicationsService.getBalanceStats();
      setBalanceStats(statsData);

    } catch (error) {
      console.error('Error fetching balance data:', error);
      toast.error('Failed to load balance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    try {
      setRefreshing(true);
      await fetchBalanceData();
      toast.success('Balance data refreshed');
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Failed to refresh balance');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateBalance = async () => {
    const amount = parseFloat(updateAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await communicationsService.updateBalance(amount, updateDescription);
      toast.success('Balance updated successfully');
      setUpdateBalanceDialogOpen(false);
      setUpdateAmount("");
      setUpdateDescription("");
      fetchBalanceData();
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'usage': return 'text-red-600';
      case 'topup': return 'text-green-600';
      case 'adjustment': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'usage': return <TrendingDown className="h-4 w-4" />;
      case 'topup': return <TrendingUp className="h-4 w-4" />;
      case 'adjustment': return <RefreshCw className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/communications">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">SMS Balance & Usage</h1>
          <p className="text-muted-foreground">
            Monitor your SMS balance and usage statistics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshBalance} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setUpdateBalanceDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Update Balance
          </Button>
        </div>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceColor(balance?.currentBalance || 0)}`}>
              TSh {(balance?.currentBalance || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last checked: {balance ? new Date(balance.lastCheckedAt).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SMS Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balanceStats?.totalSent?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TSh {(balanceStats?.totalCost || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Cost per SMS</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TSh {(balanceStats?.averageCostPerSMS || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Based on recent usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Usage</CardTitle>
            <CardDescription>SMS usage for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SMS Sent</span>
              <Badge variant="outline">{balanceStats?.todayUsage || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cost</span>
              <Badge variant="outline">TSh {((balanceStats?.todayUsage || 0) * (balanceStats?.averageCostPerSMS || 0)).toFixed(2)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Usage</CardTitle>
            <CardDescription>SMS usage for this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SMS Sent</span>
              <Badge variant="outline">{balanceStats?.weeklyUsage || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cost</span>
              <Badge variant="outline">TSh {((balanceStats?.weeklyUsage || 0) * (balanceStats?.averageCostPerSMS || 0)).toFixed(2)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>SMS usage for this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SMS Sent</span>
              <Badge variant="outline">{balanceStats?.monthlyUsage || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cost</span>
              <Badge variant="outline">TSh {((balanceStats?.monthlyUsage || 0) * (balanceStats?.averageCostPerSMS || 0)).toFixed(2)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance History */}
      <Card>
        <CardHeader>
          <CardTitle>Balance History</CardTitle>
          <CardDescription>Recent balance changes and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Previous Balance</TableHead>
                <TableHead>New Balance</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balanceHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${getChangeTypeColor(entry.changeType)}`}>
                      {getChangeTypeIcon(entry.changeType)}
                      <span className="capitalize">{entry.changeType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${entry.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.changeAmount >= 0 ? '+' : ''}TSh {entry.changeAmount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    TSh {entry.previousBalance.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    TSh {entry.currentBalance.toFixed(2)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entry.description || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {balanceHistory.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No balance history</h3>
              <p className="text-muted-foreground">
                Balance changes will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={() => {
                    if (page > 1) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={pageNum === page}
                    onClick={() => {
                      setPage(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={() => {
                    if (page < totalPages) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Update Balance Dialog */}
      <Dialog open={updateBalanceDialogOpen} onOpenChange={setUpdateBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update SMS Balance</DialogTitle>
            <DialogDescription>
              Manually adjust the SMS balance (admin only)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (TSh)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(e.target.value)}
                placeholder="Enter amount (positive to add, negative to subtract)"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Current balance: TSh {(balance?.currentBalance || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                placeholder="Reason for balance update"
              />
            </div>
            {updateAmount && !isNaN(parseFloat(updateAmount)) && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-sm">
                  Current: TSh {(balance?.currentBalance || 0).toLocaleString()}
                </p>
                <p className="text-sm">
                  Change: {parseFloat(updateAmount) >= 0 ? '+' : ''}TSh {parseFloat(updateAmount).toLocaleString()}
                </p>
                <p className="text-sm font-medium">
                  New Balance: TSh {((balance?.currentBalance || 0) + parseFloat(updateAmount)).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateBalanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance} disabled={!updateAmount || isNaN(parseFloat(updateAmount))}>
              Update Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
