import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Budget - WealthGuard",
  description: "Manage your budget"
}

export default function Budget({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 