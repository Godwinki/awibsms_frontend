'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Clock, 
  User, 
  FileText, 
  RefreshCw,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import CompanyService from '@/lib/services/company/company.service'

interface HistoryItem {
  id: string
  action: string
  description: string
  changes: any
  user: {
    id: string
    name: string
    email: string
  }
  timestamp: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
}

export function CompanyHistoryTab() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadHistory(1)
  }, [])

  const loadHistory = async (page: number) => {
    try {
      setLoading(true)
      const result = await CompanyService.getCompanyHistory(page, pagination.limit)
      setHistory(result.history)
      setPagination(result.pagination)
    } catch (error) {
      console.error('Failed to load company history:', error)
      toast({
        title: "Error",
        description: "Failed to load company history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadHistory(newPage)
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'bg-green-100 text-green-800'
      case 'update':
      case 'updated':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
      case 'deleted':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return '+'
      case 'update':
      case 'updated':
        return '✎'
      case 'delete':
      case 'deleted':
        return '✖'
      case 'login':
        return '→'
      default:
        return '•'
    }
  }

  const formatChanges = (changes: any) => {
    if (!changes || typeof changes !== 'object') return null

    return Object.entries(changes).map(([field, change]: [string, any]) => {
      if (change && typeof change === 'object' && 'from' in change && 'to' in change) {
        return (
          <div key={field} className="text-xs text-muted-foreground">
            <span className="font-medium">{field}:</span>{' '}
            <span className="text-red-600">"{change.from}"</span> → <span className="text-green-600">"{change.to}"</span>
          </div>
        )
      }
      return null
    }).filter(Boolean)
  }

  if (loading && history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Company History
          </CardTitle>
          <CardDescription>
            Track changes and activities related to company settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Company History
            </CardTitle>
            <CardDescription>
              Track changes and activities related to company settings
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadHistory(pagination.currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No History Found</h3>
            <p className="text-muted-foreground">
              No company-related activities have been recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* History Items */}
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  {/* Action Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getActionColor(item.action)}`}>
                      {getActionIcon(item.action)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getActionColor(item.action)}>
                            {item.action}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">{item.description}</p>
                        {formatChanges(item.changes) && (
                          <div className="space-y-1 mt-2">
                            {formatChanges(item.changes)}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <User className="h-3 w-3" />
                          <span>{item.user.name}</span>
                        </div>
                        <div className="text-xs">
                          {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
                  {pagination.totalItems} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
