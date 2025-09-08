import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Company Profile - AWIB SACCOS',
  description: 'Manage company information and settings',
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
