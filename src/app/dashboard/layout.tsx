import type { Metadata } from "next"
import { Header } from "./components/Header"
import { Sidebar } from "./components/Sidebar"
import { AuthGuard } from "@/components/auth/AuthGuard"

export const metadata: Metadata = {
  title: "WealthGuard Dashboard",
  description: "Manage your finances with WealthGuard",
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
