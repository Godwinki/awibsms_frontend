"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Check, FileText, BriefcaseBusiness, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Notification } from "@/lib/services/notification.service";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleClick = () => {
    setIsLoading(true);
    
    // Navigate to the resource if available
    if (notification.resourceType === 'ExpenseRequest' && notification.resourceId) {
      onMarkAsRead(notification.id);
      router.push(`/dashboard/expenses/${notification.resourceId}`);
    } else {
      onMarkAsRead(notification.id);
    }
  };
  
  // Format date to relative time (e.g., "2 hours ago")
  const formatDate = (date: string | Date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM d, h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Return appropriate icon based on notification type
  const getIcon = () => {
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
  
  // Determine if notification is clickable
  const isClickable = notification.resourceType && notification.resourceId;
  
  return (
    <div 
      className={`p-3 flex gap-3 transition-colors ${
        isClickable ? 'cursor-pointer hover:bg-slate-50' : ''
      }`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDate(notification.createdAt)}
        </p>
      </div>
      <div className="flex-shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Mark as read</span>
        </Button>
      </div>
    </div>
  );
}
