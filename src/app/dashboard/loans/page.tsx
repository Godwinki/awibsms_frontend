import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Loans Manager - WealthGuard",
  description: "Manage your Loan accounts",
}

export default function LoansPage(){
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Loan Management</h2>
        <p className="text-muted-foreground">
          Manage and review all your loan accounts in one place.
        </p>
      </div>

      <div className="flex items-center justify-center h-[400px] border rounded-lg bg-card">
        <p className="text-muted-foreground">Loans content coming soon</p>
      </div>
    </div>
  )
}
