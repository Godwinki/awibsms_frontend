"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationService } from "@/lib/services/notification.service";
import NotificationItem from "./NotificationItem";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };
  
  const fetchNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications({
        page: 1,
        limit: 5,
        status: "UNREAD"
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Update the local state
      setNotifications(notifications.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };
  
  const handleViewAll = () => {
    setOpen(false);
    router.push("/dashboard/notifications/system");
  };
  
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling for unread count (every 30 seconds)
    const intervalId = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 h-5 min-w-[1.25rem] flex items-center justify-center bg-red-500 text-white"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 flex items-center justify-between border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6">
              <span className="text-sm text-muted-foreground">No unread notifications</span>
            </div>
          )}
        </div>
        
        <div className="p-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
            className="w-full text-sm"
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
