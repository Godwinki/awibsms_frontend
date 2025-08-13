"use client";

import { useState, useEffect } from "react";
import { notificationService, type Notification, type NotificationListResponse } from "@/lib/services/notification.service";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationListProps {
  className?: string;
  showPagination?: boolean;
  limit?: number;
  filterOptions?: boolean;
}

export function NotificationList({ 
  className = "", 
  showPagination = true, 
  limit = 10,
  filterOptions = true
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = async (options: any = {}) => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit,
        ...options
      };

      // Only apply status filter if not "all"
      if (activeTab !== "all" && activeTab !== "unread" && activeTab !== "read") {
        params.type = activeTab;
      } else if (activeTab === "unread") {
        params.status = "UNREAD";
      } else if (activeTab === "read") {
        params.status = "READ";
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

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Update the notification status in the list
      setNotifications(
        notifications.map(n => 
          n.id === id ? { ...n, status: "READ" } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date to readable format
  const formatDate = (date: string | Date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
        </div>;
      case 'LEAVE':
        return <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
        </div>;
      case 'SYSTEM':
        return <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </div>;
      default:
        return <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
        </div>;
    }
  };

  // Get notification detail link
  const getNotificationLink = (notification: Notification) => {
    if (!notification.resourceType || !notification.resourceId) {
      return null;
    }

    switch (notification.resourceType.toLowerCase()) {
      case 'expense':
        return `/dashboard/expenses/${notification.resourceId}`;
      case 'leave':
        return `/dashboard/leaves/${notification.resourceId}`;
      case 'user':
        return `/dashboard/users/${notification.resourceId}`;
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, activeTab]);

  return (
    <div className={`space-y-4 ${className}`}>
      {filterOptions && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-5 lg:w-auto lg:grid-cols-auto-fit">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="EXPENSE">Expenses</TabsTrigger>
            <TabsTrigger value="SYSTEM">System</TabsTrigger>
            <TabsTrigger value="OTHER">Other</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="bg-card rounded-lg shadow">
        {loading ? (
          // Skeleton loaders
          Array(limit)
            .fill(0)
            .map((_, index) => (
              <div key={index} className={`p-4 ${index !== 0 ? 'border-t' : ''} flex items-start gap-4`}>
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            ))
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground">No notifications found</h3>
            <p className="mt-1 text-sm text-muted-foreground">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const notificationLink = getNotificationLink(notification);
              
              return (
                <div 
                  key={notification.id} 
                  className={`p-4 flex gap-4 ${notification.status === 'UNREAD' ? 'bg-accent/20' : ''}`}
                >
                  {getIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${notification.status === 'UNREAD' ? 'text-foreground font-semibold' : 'text-foreground/80'}`}>
                          {notification.title}
                          {notification.status === 'UNREAD' && (
                            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                              New
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      
                      {notification.status === 'UNREAD' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      {notification.message}
                    </p>
                    
                    {notificationLink && (
                      <Link href={notificationLink} className="text-xs text-primary hover:text-primary/80 hover:underline">
                        View details &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showPagination && meta.totalPages > 1 && (
        <Pagination
          count={meta.total}
          page={currentPage}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
