'use client'

import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Calculator, 
  PiggyBank, 
  Receipt, 
  Package, 
  Calendar, 
  Settings, 
  PieChart, 
  UserCog, 
  Database, 
  Shield, 
  Lock, 
  Monitor,
  FileText, 
  BellRing, 
  Building2, 
  Briefcase, 
  HelpCircle, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  Send, 
  CircleDollarSign, 
  CalendarRange, 
  BadgeDollarSign, 
  CreditCard, 
  Clock, 
  LucideIcon,
  Edit3,
  Newspaper,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
  Building
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { ShortcutTrigger } from '@/components/shortcuts/ShortcutTrigger'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'

interface NavItem {
  title: string
  icon: LucideIcon
  href: string
  roles: UserRole[]
}

interface NavSeparator {
  type: 'separator'
  title: string
}

type NavItems = (NavItem | NavSeparator)[]

function isNavItem(item: NavItem | NavSeparator): item is NavItem {
  return !('type' in item)
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isCmsExpanded, setIsCmsExpanded] = useState(false)
  const pathname = usePathname()
  const { hasPermission, currentBranch, user } = useAuth()
  const { displayName, logo } = useCompanyInfo()

  // Use branch name if available, otherwise fall back to company name
  const sidebarDisplayName = currentBranch?.displayName || currentBranch?.name || displayName

  const navItems: NavItems = [
    // Main Navigation
    { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['admin', 'super_admin', 'manager', 'loan_officer', 'accountant', 'cashier', 'it', 'clerk', 'loan_board', 'board_director', 'marketing_officer'] },
    { title: 'Members', icon: Users, href: '/dashboard/members', roles: ['admin', 'super_admin', 'manager', 'loan_officer', 'clerk'] },
    { title: 'Accounting', icon: Calculator, href: '/dashboard/accounting', roles: ['admin', 'super_admin', 'manager', 'accountant'] },
    { title: 'Loans', icon: CircleDollarSign, href: '/dashboard/loans', roles: ['admin', 'super_admin', 'manager', 'loan_officer', 'loan_board'] },
    { title: 'Expenses', icon: CreditCard, href: '/dashboard/expenses', roles: ['admin', 'super_admin', 'manager', 'accountant', 'cashier', 'loan_officer','it', 'hr', 'clerk', 'board_director', 'marketing_officer','loan_board' ] },
    { title: 'Budget', icon: Calculator, href: '/dashboard/budget', roles: ['admin', 'super_admin', 'manager', 'accountant'] },
    { title: 'Inventory & Assets', icon: Package, href: '/dashboard/inventory', roles: ['admin', 'super_admin', 'manager', 'clerk'] },
    { title: 'Leaves', icon: Clock, href: '/dashboard/leaves', roles: ['admin', 'super_admin', 'manager', 'loan_officer', 'accountant', 'cashier', 'it', 'clerk', 'loan_board', 'board_director', 'marketing_officer'] },
    { title: 'Salary & Wages', icon: Briefcase, href: '/dashboard/salary', roles: ['admin', 'super_admin', 'accountant', 'cashier', 'manager'] },
    
    // Admin Controls (Only visible to admin and specific roles)
    { type: 'separator', title: 'Admin Controls' },
    { title: 'Company Profile', icon: Building2, href: '/dashboard/company', roles: ['admin', 'super_admin', 'manager'] },
    { title: 'Branches', icon: Building, href: '/dashboard/branches', roles: ['admin', 'super_admin', 'manager'] },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['admin', 'super_admin'] },
    { title: 'Reports', icon: PieChart, href: '/dashboard/reports', roles: ['admin', 'super_admin', 'manager', 'accountant'] },
    { title: 'Users', icon: UserCog, href: '/dashboard/users', roles: ['admin', 'super_admin'] },
    { title: 'Locked Accounts', icon: Lock, href: '/dashboard/locked-accounts', roles: ['admin', 'super_admin'] },
    { title: 'Active Sessions', icon: Monitor, href: '/dashboard/sessions', roles: ['admin', 'super_admin', 'it'] },
    { title: 'Super Admin Management', icon: Shield, href: '/dashboard/super-admin', roles: ['super_admin'] },
    { title: 'Audit Logs', icon: FileText, href: '/dashboard/audit-logs', roles: ['admin', 'super_admin', 'it'] },
    { title: 'Notifications', icon: Send, href: '/dashboard/notifications', roles: ['admin', 'super_admin', 'manager', 'loan_officer', 'accountant', 'cashier', 'it',] },
    { title: 'Departments', icon: Building2, href: '/dashboard/departments', roles: ['admin', 'super_admin'] },
    { title: 'Roles & Permissions', icon: Shield, href: '/dashboard/roles', roles: ['admin', 'super_admin'] },
    { title: 'Shortcuts', icon: Zap, href: '/dashboard/shortcuts', roles: ['admin', 'super_admin'] },
    
    // Communications
    { type: 'separator', title: 'Communications' },
    { title: 'Email Center', icon: Mail, href: '/dashboard/notifications/mail', roles: ['admin', 'super_admin', 'manager', 'marketing_officer', 'cashier', 'loan_officer', 'accountant', 'it', 'clerk', 'loan_board', 'board_director', 'marketing_officer'] },
    { title: 'SMS Communications', icon: MessageSquare, href: '/dashboard/communications', roles: ['admin', 'super_admin', 'manager', 'marketing_officer', 'cashier', 'loan_officer', 'accountant', 'it', 'clerk', 'loan_board', 'board_director', 'marketing_officer'] },
    
    
    // Content Management System1`  q1  ``````````````````````````````````````````````````
    { type: 'separator', title: 'Content Management' },
    
    // System
    { type: 'separator', title: 'System' },
    { title: 'Backup & Restore', icon: Database, href: '/dashboard/backup', roles: ['admin', 'super_admin', 'it'] },
    { title: 'Help & Support', icon: HelpCircle, href: '/dashboard/support', roles: ['admin', 'super_admin', 'manager', 'loan_officer', 'accountant', 'cashier', 'it', 'clerk', 'loan_board', 'board_director', 'marketing_officer'] },
    { title: 'System Alerts', icon: AlertTriangle, href: '/dashboard/alerts', roles: ['admin', 'super_admin', 'it'] },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if ('type' in item) {
      // Show separator if there are visible items after it
      const nextItems = navItems.slice(navItems.indexOf(item) + 1);
      return nextItems.some(nextItem => 
        !('type' in nextItem) && hasPermission(nextItem.roles)
      );
    }
    return hasPermission(item.roles);
  });

  return (
    <div 
      className={`relative flex flex-col h-screen border-r transition-all duration-300 bg-background group ${
        isCollapsed ? "w-16 hover:w-64" : "w-64"
      }`}
    >
      <div className="flex items-center p-4 gap-2">
        {logo ? (
          <img 
            src={logo} 
            alt={sidebarDisplayName}
            className="h-6 w-6 flex-shrink-0 object-contain"
          />
        ) : (
          <Shield className="h-6 w-6 text-primary flex-shrink-0" />
        )}
        <span className={`font-bold text-xl whitespace-nowrap transition-all duration-300 ${
          isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}>
          {sidebarDisplayName}
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-accent rounded-lg transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-2 p-2">
          {filteredNavItems.map((item, index) => {
            if ('type' in item && item.type === 'separator') {
              // Special handling for Content Management separator
              if (item.title === 'Content Management') {
                return (
                  <div key={index}>
                    <div 
                      className={`px-3 py-2 text-xs font-semibold text-muted-foreground ${
                        isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      }`}
                    >
                      {item.title}
                    </div>
                    
                    {/* CMS Dropdown Menu */}
                    <div className="ml-2">
                      <button
                        onClick={() => setIsCmsExpanded(!isCmsExpanded)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full text-left ${
                          isCollapsed ? "justify-center group-hover:justify-start" : ""
                        } ${
                          (pathname && pathname.startsWith('/dashboard/cms'))
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-accent"
                        }`}
                      >
                        <Edit3 className="h-5 w-5 flex-shrink-0" />
                        <span className={`whitespace-nowrap transition-all duration-300 flex-1 ${
                          isCollapsed ? "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto" : "opacity-100"
                        }`}>
                          Content Management
                        </span>
                        <span className={`transition-all duration-300 ${
                          isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                        }`}>
                          {isCmsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      </button>
                      
                      {/* CMS Submenu */}
                      {isCmsExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          <Link
                            href="/dashboard/cms/blog"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                              pathname === '/dashboard/cms/blog'
                                ? "bg-primary text-primary-foreground" 
                                : "hover:bg-accent"
                            }`}
                          >
                            <Newspaper className="h-4 w-4 flex-shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-300 ${
                              isCollapsed ? "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto" : "opacity-100"
                            }`}>
                              Blog & News
                            </span>
                          </Link>
                          
                          <Link
                            href="/dashboard/cms/announcements"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                              pathname === '/dashboard/cms/announcements'
                                ? "bg-primary text-primary-foreground" 
                                : "hover:bg-accent"
                            }`}
                          >
                            <Send className="h-4 w-4 flex-shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-300 ${
                              isCollapsed ? "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto" : "opacity-100"
                            }`}>
                              Announcements
                            </span>
                          </Link>
                          
                          <Link
                            href="/dashboard/cms/reviews"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                              pathname === '/dashboard/cms/reviews'
                                ? "bg-primary text-primary-foreground" 
                                : "hover:bg-accent"
                            }`}
                          >
                            <Star className="h-4 w-4 flex-shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-300 ${
                              isCollapsed ? "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto" : "opacity-100"
                            }`}>
                              Reviews & Testimonials
                            </span>
                          </Link>
                          
                          <Link
                            href="/dashboard/cms/documents"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                              pathname === '/dashboard/cms/documents'
                                ? "bg-primary text-primary-foreground" 
                                : "hover:bg-accent"
                            }`}
                          >
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className={`whitespace-nowrap transition-all duration-300 ${
                              isCollapsed ? "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto" : "opacity-100"
                            }`}>
                              Documents & Forms
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
              
              // Regular separator
              return (
                <div 
                  key={index}
                  className={`px-3 py-2 text-xs font-semibold text-muted-foreground ${
                    isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                  }`}
                >
                  {item.title}
                </div>
              )
            }

            if (isNavItem(item)) {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isCollapsed ? "justify-center group-hover:justify-start" : ""
                  } ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-300 ${
                    isCollapsed ? "opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto" : "opacity-100"
                  }`}>
                    {item.title}
                  </span>
                </Link>
              )
            }

            return null
          })}
        </nav>
      </div>

      {/* Quick Actions Trigger */}
      <div className={`p-4 border-t ${isCollapsed ? "px-2" : ""}`}>
        <ShortcutTrigger 
          variant={isCollapsed ? "minimal" : "button"}
          className={`w-full ${isCollapsed ? "justify-center" : ""}`}
        />
      </div>

      <div className={`p-4 border-t text-sm text-muted-foreground ${
        isCollapsed ? "text-center group-hover:text-left" : ""
      }`}>
        <span className={`transition-all duration-300 ${
          isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}>
          {sidebarDisplayName} v1.0.0
        </span>
      </div>
    </div>
  )
}
