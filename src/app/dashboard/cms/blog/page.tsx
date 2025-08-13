"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  FileText,
  TrendingUp,
  Eye,
  Calendar,
  BarChart3
} from "lucide-react"

// Import blog components
import BlogForm from './components/BlogForm'
import BlogList from './components/BlogList'
import BlogPreview from './components/BlogPreview'
import DeleteConfirmDialog from './components/DeleteConfirmDialog'
import { blogService, type Blog, type CreateBlogData } from '@/lib/services/blogService'

export default function BlogPage() {
  // State management
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Selected items
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'sw'>('en')
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    totalViews: 0
  })

  // Load blogs on component mount
  useEffect(() => {
    loadBlogs()
    loadStats()
  }, [])

  const loadBlogs = async () => {
    try {
      setLoading(true)
      const blogData = await blogService.getAllBlogs()
      setBlogs(blogData)
      setError(null)
    } catch (err) {
      console.error('Failed to load blogs:', err)
      setError('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await blogService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  // Event handlers
  const handleCreateBlog = async (blogData: CreateBlogData, featuredImage?: File) => {
    try {
      await blogService.createBlog(blogData, featuredImage)
      await loadBlogs()
      await loadStats()
      setShowCreateForm(false)
    } catch (err) {
      console.error('Failed to create blog:', err)
      throw err
    }
  }

  const handleEditBlog = async (blogData: Partial<CreateBlogData>, featuredImage?: File) => {
    if (!selectedBlog) return
    
    try {
      await blogService.updateBlog(selectedBlog.id, blogData, featuredImage)
      await loadBlogs()
      await loadStats()
      setShowEditForm(false)
      setSelectedBlog(null)
    } catch (err) {
      console.error('Failed to update blog:', err)
      throw err
    }
  }

  const handleDeleteBlog = async (blog: Blog) => {
    try {
      await blogService.deleteBlog(blog.id)
      await loadBlogs()
      await loadStats()
      setShowDeleteDialog(false)
      setSelectedBlog(null)
    } catch (err) {
      console.error('Failed to delete blog:', err)
      throw err
    }
  }

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowEditForm(true)
  }

  const handlePreview = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowPreview(true)
  }

  const handleDelete = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowDeleteDialog(true)
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Blogs</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadBlogs}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts for your website
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Blog Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Blog List */}
      <BlogList
        blogs={blogs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPreview={handlePreview}
      />

      {/* Modals */}
      <BlogForm
        blog={null}
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateBlog}
        mode="create"
      />

      <BlogForm
        blog={selectedBlog}
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false)
          setSelectedBlog(null)
        }}
        onSubmit={handleEditBlog}
        mode="edit"
      />

      <BlogPreview
        blog={selectedBlog}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false)
          setSelectedBlog(null)
        }}
        language={previewLanguage}
        onLanguageChange={setPreviewLanguage}
      />

      <DeleteConfirmDialog
        blog={selectedBlog}
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedBlog(null)
        }}
        onConfirm={handleDeleteBlog}
      />
    </div>
  )
}
