import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accounts - WealthGuard",
  description: "Manage your financial accounts",
}

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
        <p className="text-muted-foreground">
          Manage and review all your financial accounts in one place.
        </p>
      </div>

      <div className="flex items-center justify-center h-[400px] border rounded-lg bg-card">
        <p className="text-muted-foreground">Accounts content coming soon</p>
      </div>
    </div>
  )
}
