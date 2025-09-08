import apiCall from '@/lib/axios';

export interface Blog {
  id: string;
  title: string;
  titleSwahili?: string;
  content: string;
  contentSwahili?: string;
  excerpt: string;
  excerptSwahili?: string;
  slug: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublic: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt?: string;
  viewCount?: number;
}

export interface CreateBlogData {
  title: string;
  titleSwahili?: string;
  content: string;
  contentSwahili?: string;
  excerpt: string;
  excerptSwahili?: string;
  slug: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublic: boolean;
}

class BlogService {
  /**
   * Get all blogs for CMS management
   */
  async getAllBlogs(): Promise<Blog[]> {
    const response = await apiCall('/content/blogs');
    return response.data.blogs || [];
  }

  /**
   * Get a single blog by ID
   */
  async getBlogById(id: string): Promise<Blog> {
    const response = await apiCall(`/content/blogs/${id}`);
    return response.data.blog;
  }

  /**
   * Create a new blog post
   */
  async createBlog(blogData: CreateBlogData, featuredImage?: File): Promise<Blog> {
    const formData = new FormData();
    
    // Add blog data
    Object.entries(blogData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add featured image if provided
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    const response = await apiCall('/content/blogs', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.blog;
  }

  /**
   * Update an existing blog post
   */
  async updateBlog(id: string, blogData: Partial<CreateBlogData>, featuredImage?: File): Promise<Blog> {
    const formData = new FormData();
    
    // Add blog data
    Object.entries(blogData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add featured image if provided
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    const response = await apiCall(`/content/blogs/${id}`, {
      method: 'PUT',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.blog;
  }

  /**
   * Delete a blog post
   */
  async deleteBlog(id: string): Promise<void> {
    await apiCall(`/content/blogs/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get blog categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiCall('/content/blogs/categories');
    return response.data.categories || [];
  }

  /**
   * Get popular tags
   */
  async getTags(): Promise<string[]> {
    const response = await apiCall('/content/blogs/tags');
    return response.data.tags || [];
  }

  /**
   * Get blog statistics
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    totalViews: number;
  }> {
    const response = await apiCall('/content/blogs/stats');
    return response.data.stats;
  }

  /**
   * Generate slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Validate blog data
   */
  validateBlogData(blogData: Partial<CreateBlogData>): string[] {
    const errors: string[] = [];

    if (!blogData.title?.trim()) {
      errors.push('Title is required');
    }

    if (!blogData.content?.trim()) {
      errors.push('Content is required');
    }

    if (!blogData.excerpt?.trim()) {
      errors.push('Excerpt is required');
    }

    if (!blogData.slug?.trim()) {
      errors.push('Slug is required');
    }

    if (!blogData.category?.trim()) {
      errors.push('Category is required');
    }

    if (blogData.slug && !/^[a-z0-9-]+$/.test(blogData.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    }

    return errors;
  }
}

export const blogService = new BlogService();
