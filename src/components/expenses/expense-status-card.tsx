import { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExpenseStatusCardProps {
  title: string;
  description: string;
  count: number | null;
  icon: ReactNode;
  href: string;
  className?: string;
}

export function ExpenseStatusCard({
  title,
  description,
  count,
  icon,
  href,
  className,
}: ExpenseStatusCardProps) {
  return (
    <Link href={href}>
      <Card className={cn("transition-all hover:shadow-md cursor-pointer", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          {count !== null && (
            <div className="text-2xl font-bold">{count}</div>
          )}
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
} 