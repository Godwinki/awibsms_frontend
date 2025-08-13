"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MailIcon, MessageSquareIcon, ShieldAlertIcon, BellIcon } from "lucide-react";
import { authService } from "@/lib/services/auth.service";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const notificationTypes = [
  {
    key: "system",
    title: "System Alerts",
    description: "Critical system notifications and logs.",
    icon: <ShieldAlertIcon className="w-10 h-10 text-red-500" />,
    roles: ["admin"],
    href: "/dashboard/notifications/system",
  },
  {
    key: "sms",
    title: "Bulk SMS",
    description: "Send messages to multiple recipients at once.",
    icon: <MessageSquareIcon className="w-10 h-10 text-blue-500" />,
    roles: ["admin", "manager", "user"],
    href: "/dashboard/notifications/sms",
  },
  {
    key: "mail",
    title: "Mailing",
    description: "Send and manage emails to staff or users.",
    icon: <MailIcon className="w-10 h-10 text-green-500" />,
    roles: ["admin", "manager"],
    href: "/dashboard/notifications/mail",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("my-notifications");

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  if (!currentUser) return null;

  const visibleCards = notificationTypes.filter(type =>
    type.roles.includes(currentUser.role)
  );

  const isAdmin = currentUser.role === "admin";

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications & Communications</h1>
        {isAdmin && (
          <Button 
            onClick={() => setActiveTab(activeTab === "my-notifications" ? "management" : "my-notifications")}
            className="mt-4 sm:mt-0"
          >
            {activeTab === "my-notifications" ? "Manage Communication Tools" : "View My Notifications"}
          </Button>
        )}
      </div>

      {isAdmin ? (
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="my-notifications">My Notifications</TabsTrigger>
            <TabsTrigger value="management">Communication Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-notifications" className="space-y-4">
            <div className="bg-card p-4 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BellIcon className="mr-2 h-5 w-5" />
                All Notifications
              </h2>
              <NotificationList
                limit={10}
                showPagination={true}
                filterOptions={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="management" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleCards.map(card => (
                <div key={card.key} className="bg-card rounded-xl shadow p-6 flex flex-col items-center border hover:shadow-lg transition">
                  <div className="mb-4">{card.icon}</div>
                  <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                  <p className="text-muted-foreground mb-4 text-center">{card.description}</p>
                  <Button
                    onClick={() => router.push(card.href)}
                    className="w-full"
                  >
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Non-admin users just see their notifications and any available communication tools
        <div className="space-y-8">
          <div className="bg-card p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BellIcon className="mr-2 h-5 w-5" />
              My Notifications
            </h2>
            <NotificationList
              limit={10}
              showPagination={true}
              filterOptions={true}
            />
          </div>

          {visibleCards.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Communication Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visibleCards.map(card => (
                  <div key={card.key} className="bg-card rounded-xl shadow p-6 flex flex-col items-center border hover:shadow-lg transition">
                    <div className="mb-4">{card.icon}</div>
                    <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                    <p className="text-muted-foreground mb-4 text-center">{card.description}</p>
                    <Button
                      onClick={() => router.push(card.href)}
                      className="w-full"
                    >
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
