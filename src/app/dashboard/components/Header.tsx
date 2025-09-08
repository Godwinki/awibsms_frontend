"use client"

import { useState, useEffect, useRef } from "react"
import { LogOut, Settings, User, Bell, Check, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { notificationService, type Notification } from "@/lib/services/notification.service"
import { format } from "date-fns"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [previousCount, setPreviousCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const notificationSound = useRef<HTMLAudioElement | null>(null)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Get user initials for avatar fallback
  const userInitials = user ? 
    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() 
    : 'UN'

  // Get full name
  const fullName = user ? 
    `${user.firstName || ''} ${user.lastName || ''}`.trim() 
    : 'User'
    
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      // Play sound if count increased (and not initial load)
      if (previousCount !== 0 && count > previousCount) {
        // Alternative method: Create fresh audio element for each play
        try {
          const audio = new Audio('/sounds/notification.wav');
          audio.volume = 0.5;
          audio.play().catch(err => {
            console.warn("Could not play notification sound:", err);
          });
        } catch (error) {
          console.warn("Could not create audio element:", error);
        }
      }
      setPreviousCount(unreadCount);
      setUnreadCount(count);
    } catch (error: any) {
      // Don't log 401 errors as they're handled by axios interceptor
      if (error.response?.status !== 401) {
        console.error("Failed to fetch unread count:", error);
      }
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
    } catch (error: any) {
      // Don't log 401 errors as they're handled by axios interceptor
      if (error.response?.status !== 401) {
        console.error("Failed to fetch notifications:", error);
      }
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
  
  // Format date to relative time (e.g., "2 hours ago")
  const formatDate = (date: string | Date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM d, h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
        </div>;
      case 'SYSTEM':
        return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </div>;
      default:
        return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
        </div>;
    }
  };
  
  const getNotificationLink = (notification: Notification) => {
    if (notification.resourceType === 'ExpenseRequest' && notification.resourceId) {
      return `/dashboard/expenses/${notification.resourceId}`;
    }
    return null;
  };
  
  useEffect(() => {
    // Initialize audio element with better error handling
    try {
      notificationSound.current = new Audio();
      notificationSound.current.preload = 'auto';
      
      // Set the source and handle loading
      const loadAudio = async () => {
        try {
          notificationSound.current!.src = '/sounds/notification.wav';
          await notificationSound.current!.load();
        } catch (error) {
          console.warn('Could not load notification sound:', error);
        }
      };
      
      loadAudio();
    } catch (error) {
      console.warn('Could not initialize audio element:', error);
    }
    
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
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="font-semibold">
          Welcome, {user?.firstName || 'User'}
        </div>
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 px-1.5 h-5 min-w-[1.25rem] flex items-center justify-center bg-red-500 text-white"
                    variant="destructive"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[350px] sm:w-[400px] p-0 overflow-hidden flex flex-col">
              <SheetHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg">Notifications</SheetTitle>
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
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 flex gap-3 hover:bg-muted/50 transition-colors">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0 -mt-1 -mr-1"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </p>
                            {getNotificationLink(notification) && (
                              <Link 
                                href={getNotificationLink(notification)!} 
                                className="text-xs ml-auto text-primary hover:underline"
                                onClick={() => setOpen(false)}
                              >
                                View
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t have any unread notifications.
                    </p>
                  </div>
                )}
              </div>
              
              <SheetFooter className="p-4 border-t mt-auto flex justify-center">
                <Link 
                  href="/dashboard/notifications" 
                  onClick={() => setOpen(false)} 
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    View All Notifications
                  </Button>
                </Link>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <ThemeToggle />

          <div className="flex items-center gap-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-3 rounded-full outline-none ring-offset-2 transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary">
                  <Avatar>
                    <AvatarImage src={user?.profilePicture || ""} alt={fullName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:inline-block">{fullName}</span>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[200px] rounded-md bg-background p-2 shadow-md"
                  align="end"
                >
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground mb-2 border-b">
                    {user?.email}
                  </div>
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 rounded-md p-2 text-sm outline-none hover:bg-accent cursor-pointer"
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenu.Item>
                  
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 rounded-md p-2 text-sm outline-none hover:bg-accent cursor-pointer"
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenu.Item>
                  
                  <DropdownMenu.Separator className="my-2 h-px bg-border" />
                  
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 rounded-md p-2 text-sm outline-none hover:bg-accent cursor-pointer text-red-500 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </header>
  )
}