"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Star,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Placeholder data
  const reviews = [
    {
      id: 1,
      name: "Marry Mgonja",
      role: "Member",
      company: "",
      quote: "I have never faced any challenges when applying for a loan from Arusha Women in Business SACCOS, and even the interest rates on loans are low. The growth of my business is a result of the loans I receive from Arusha Women in Business SACCOS.",
      rating: 5,
      image: "/testimonials/marry.jpg",
      status: "approved",
      submittedDate: "2024-01-15",
      approvedBy: "Admin"
    },
    {
      id: 2,
      name: "Irene Manzi",
      role: "Member",
      company: "Irene Bakery and Fast Food",
      quote: "My name is Irene Manzi, and I am the owner of Irene Bakery and Fast Food in Arusha. As you see me here, I have achieved great success through Arusha Women in Business SACCOS.",
      rating: 5,
      image: "/testimonials/irene.jpg",
      status: "approved",
      submittedDate: "2024-01-10",
      approvedBy: "Manager"
    },
    {
      id: 3,
      name: "Grace Kimaro",
      role: "Member",
      company: "Grace Fashion Store",
      quote: "The support I received from AWIB SACCOS has transformed my business completely. I highly recommend their services to all women entrepreneurs.",
      rating: 4,
      image: "/testimonials/grace.jpg",
      status: "pending",
      submittedDate: "2024-01-18",
      approvedBy: null
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />
      case "pending": return <Clock className="h-4 w-4" />
      case "rejected": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews & Testimonials</h1>
          <p className="text-muted-foreground">
            Manage customer reviews and testimonials for your website
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Review
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Reviews List */}
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.image} alt={review.name} />
                        <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <CardTitle className="text-lg">{review.name}</CardTitle>
                          <CardDescription>
                            {review.role} {review.company && `• ${review.company}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({review.rating}/5)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(review.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(review.status)}
                          <span>{review.status}</span>
                        </span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                      "{review.quote}"
                    </blockquote>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Submitted: {review.submittedDate}
                        </div>
                        {review.approvedBy && (
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            Approved by: {review.approvedBy}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        {review.status === "pending" && (
                          <>
                            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold">Approved Reviews</h3>
                <p className="text-muted-foreground">
                  Reviews that are published on your website will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="mt-4 text-lg font-semibold">Pending Reviews</h3>
                <p className="text-muted-foreground">
                  Reviews waiting for approval will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold">Rejected Reviews</h3>
                <p className="text-muted-foreground">
                  Reviews that have been rejected will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
