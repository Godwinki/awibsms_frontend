import { useState, useEffect } from 'react'
import CompanyService, { CompanySettings } from '@/lib/services/company/company.service'

export function useCompanyInfo() {
  const [company, setCompany] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCompanyInfo()
  }, [])

  const loadCompanyInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const companyData = await CompanyService.getCompanySettings()
      setCompany(companyData)
    } catch (err) {
      console.error('Failed to load company info:', err)
      setError(err instanceof Error ? err.message : 'Failed to load company info')
    } finally {
      setLoading(false)
    }
  }

  const refreshCompanyInfo = () => {
    loadCompanyInfo()
  }

  return {
    company,
    loading,
    error,
    refreshCompanyInfo,
    displayName: company?.displayName || company?.companyName || 'WealthGuard',
    logo: company?.logo
  }
}
