import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support - WealthGuard",
  description: "Manage your Loan accounts",
}

export default function LoansPage(){
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help & Management</h2>
        <p className="text-muted-foreground">
        Help & Management
        </p>
      </div>

      <div className="flex items-center justify-center h-[400px] border rounded-lg bg-card">
        <p className="text-muted-foreground">Help & Management</p>
      </div>
    </div>
  )
}
