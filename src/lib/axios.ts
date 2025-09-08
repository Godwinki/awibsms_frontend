import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Use NEXT_PUBLIC_API_URL environment variable for API base URL
const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

console.log('Using API URL:', baseURL);

// Create a flag to prevent multiple redirects
let isRedirecting = false;

// Create a flag to track intentional logout
let isLoggingOut = false;

// Export function to set logout state
export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth header if explicitly requested (for 2FA verification)
    if ((config as any).skipAuth) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Token expired, logging out...');
      
      // If this is an intentional logout, don't show session expired message
      if (isLoggingOut) {
        console.log('Intentional logout in progress, skipping session expired handling');
        return Promise.reject(error);
      }
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Dispatch custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('token-expired'));
      }
      
      // Prevent multiple redirects
      if (!isRedirecting) {
        isRedirecting = true;
        
        // Only redirect if we're not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.log('Redirecting to login page due to token expiration...');
          console.log('Current path:', window.location.pathname);
          
          // Small delay to allow any toast notifications to show
          setTimeout(() => {
            // Add cache-busting parameter and force reload
            const timestamp = new Date().getTime();
            const loginUrl = `/login?message=session-expired&t=${timestamp}`;
            console.log('Redirecting to:', loginUrl);
            
            // Use window.location.replace instead of href to prevent back button issues
            window.location.replace(loginUrl);
          }, 1500);
        }
        
        // Reset the flag after a short delay
        setTimeout(() => {
          isRedirecting = false;
        }, 3000);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;