import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mails - WealthGuard",
  description: "Manage your Mails",
}

export default function LoansPage(){
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mails</h2>
        <p className="text-muted-foreground">
        Mails
        </p>
      </div>

      <div className="flex items-center justify-center h-[400px] border rounded-lg bg-card">
        <p className="text-muted-foreground">Mails</p>
      </div>
    </div>
  )
}
