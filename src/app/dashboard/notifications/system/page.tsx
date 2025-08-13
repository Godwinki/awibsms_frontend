"use client";

import { useEffect, useState } from "react";
import { notificationService, type Notification } from "@/lib/services/notification.service";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Check, CreditCard, FileText, BriefcaseBusiness, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [markingAll, setMarkingAll] = useState(false);
  
  const fetchNotifications = async (page = 1, tab = currentTab) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      
      if (tab === "unread") {
        params.status = "UNREAD";
      } else if (tab === "expense") {
        params.type = "EXPENSE";
      } else if (tab === "system") {
        params.type = "SYSTEM";
      }
      
      const response = await notificationService.getNotifications(params);
      setNotifications(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    fetchNotifications(1, value);
  };
  
  const handlePageChange = (page: number) => {
    fetchNotifications(page);
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Update the UI by refetching or by updating the local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, status: 'READ' } : n
      ));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      // Refetch notifications
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };
  
  // Get icon based on notification type
  const getIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'EXPENSE':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'LEAVE':
        return <BriefcaseBusiness className="h-5 w-5 text-green-500" />;
      case 'SYSTEM':
        return <Bell className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format date
  const formatDate = (date: string | Date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">System Notifications</h1>
        
        {notifications.some(n => n.status === 'UNREAD') && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>
      
      <Tabs value={currentTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <p className="text-muted-foreground">No notifications found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <Card key={notification.id} className={`border-l-4 ${
                  notification.status === 'UNREAD' ? 'border-l-blue-500' : 'border-l-gray-200'
                }`}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-center gap-4">
                    <div>
                      {getIcon(notification)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <CardDescription className="mt-1 text-sm">
                        {notification.message}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardFooter className="p-4 pt-2 flex justify-between">
                    <div className="text-xs text-muted-foreground">
                      Type: <span className="font-medium">{notification.type}</span>
                    </div>
                    <div className="flex gap-2">
                      {notification.resourceType === 'ExpenseRequest' && notification.resourceId && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/expenses/${notification.resourceId}`}>
                            View Details
                          </Link>
                        </Button>
                      )}
                      
                      {notification.status === 'UNREAD' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {meta.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination count={meta.total} totalPages={meta.totalPages} page={meta.page} onPageChange={handlePageChange} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
