import Link from "next/link"
import { Card } from "@/components/ui/card"

interface LeaveStatusCardProps {
  title: string
  count: number | null
  description: string
  icon: React.ReactNode
  href: string
  className?: string
}

export function LeaveStatusCard({
  title,
  count,
  description,
  icon,
  href,
  className
}: LeaveStatusCardProps) {
  return (
    <Link href={href}>
      <Card className={`p-6 hover:border-primary/50 transition-colors ${className}`}>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            {count !== null && (
              <p className="text-2xl font-bold">{count}</p>
            )}
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}