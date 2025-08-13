'use client'

import { useState, useEffect } from 'react'
import { withRoleProtection } from '@/components/auth/withRoleProtection'
import { LockedAccount, userService } from '@/lib/services/user.service'
import { Button } from '@/components/ui/button'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useToast } from '@/components/ui/use-toast'
import { Lock, Loader2 } from 'lucide-react'

function LockedAccountsPage() {
  const [accounts, setAccounts] = useState<LockedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLockedAccounts = async () => {
    try {
      setLoading(true)
      const data = await userService.getLockedAccounts()
      setAccounts(data)
    } catch (error: any) {
      console.error('Error fetching locked accounts:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch locked accounts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLockedAccounts()
  }, [])

  const handleUnlock = async (id: string) => {
    try {
      await userService.unlockAccount(id)
      toast({
        title: "Success",
        description: "Account unlocked successfully",
      })
      fetchLockedAccounts() // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unlock account",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Locked Accounts</h1>
          <p className="text-muted-foreground">Manage locked user accounts</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchLockedAccounts()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Lock className="h-4 w-4 mr-2" />
          )}
          {loading ? "Loading..." : "Refresh List"}
        </Button>
      </div>

      <DataTable 
        columns={columns(handleUnlock)} 
        data={accounts}
      />
    </div>
  )
}

// Export the protected component
export default withRoleProtection(LockedAccountsPage, ['admin']) 