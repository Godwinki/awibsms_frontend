import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Backup and Restore - WealthGuard",
  description: "Backup and Restore",
}

export default function LoansPage(){
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Backup and Restore</h2>
        <p className="text-muted-foreground">
         Backup and restore data, and check status
        </p>
      </div>

      <div className="flex items-center justify-center h-[400px] border rounded-lg bg-card">
        <p className="text-muted-foreground">Backup system coming soon</p>
      </div>
    </div>
  )
}
