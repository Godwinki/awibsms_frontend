import axios from '@/lib/axios';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

// Utility function to add delay with exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DepartmentService {
  // Maximum number of retry attempts
  private maxRetries = 3;
  // Cache departments to reduce API calls
  private departmentsCache: Department[] | null = null;
  private lastFetchTime: number = 0;
  private cacheValidityTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  async getDepartments(forceRefresh = false) {
    // Return cached data if available and not expired
    const now = Date.now();
    if (
      !forceRefresh && 
      this.departmentsCache && 
      now - this.lastFetchTime < this.cacheValidityTime
    ) {
      console.log('Using cached departments data');
      return this.departmentsCache;
    }

    let retries = 0;
    let backoffTime = 1000; // Start with 1 second

    while (retries <= this.maxRetries) {
      try {
        console.log('Fetching departments from API');
        const response = await axios.get('/departments');
        
        // Update cache
        this.departmentsCache = response.data.data;
        this.lastFetchTime = now;
        
        return response.data.data;
      } catch (error: any) {
        // If it's a rate limit error and we haven't exceeded max retries
        if (error.response?.status === 429 && retries < this.maxRetries) {
          console.log(`Rate limited. Retrying in ${backoffTime/1000} seconds...`);
          
          // Wait for backoff time
          await delay(backoffTime);
          
          // Increase backoff time exponentially
          backoffTime *= 2;
          
          // Increment retry counter
          retries++;
        } else {
          // For other errors or if we've exhausted retries, try to return cached data if available
          console.error("Error fetching departments:", error);
          
          if (this.departmentsCache) {
            console.log('Using cached departments data after fetch error');
            return this.departmentsCache;
          }
          
          throw error;
        }
      }
    }

    // If we've exhausted all retries, return cached data if available
    if (this.departmentsCache) {
      console.log('Using cached departments data after retry failure');
      return this.departmentsCache;
    }

    throw new Error("Failed to fetch departments after multiple retries");
  }

  // Force invalidate cache and reload departments
  async refreshDepartments() {
    return this.getDepartments(true);
  }

  async createDepartment(data: Partial<Department>) {
    const response = await axios.post('/departments', data);
    // Invalidate cache
    this.departmentsCache = null;
    return response.data.data;
  }

  async updateDepartment(id: string, data: Partial<Department>) {
    const response = await axios.patch(`/departments/${id}`, data);
    // Invalidate cache
    this.departmentsCache = null;
    return response.data.data;
  }

  async deleteDepartment(id: string) {
    const response = await axios.delete(`/departments/${id}`);
    // Invalidate cache
    this.departmentsCache = null;
    return response.data;
  }
}

export const departmentService = new DepartmentService(); 