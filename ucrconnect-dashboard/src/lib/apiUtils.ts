// Utility functions for API calls with automatic token validation

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

/**
 * Makes an API call with automatic token validation and session expiration handling
 */
export async function apiCall<T = any>(
  url: string, 
  options: ApiCallOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    credentials = 'include'
  } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear the access token cookie
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Redirect to login with session expired message
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('session_expired', 'true');
      window.location.href = loginUrl.toString();
      
      // Throw an error to stop execution
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData: ApiResponse = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
      }));
      
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data.data || data as T;
  } catch (error) {
    // Re-throw session expired errors
    if (error instanceof Error && error.message === 'Session expired') {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Makes a GET request with automatic token validation
 */
export async function apiGet<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
  return apiCall<T>(url, { method: 'GET', headers });
}

/**
 * Makes a POST request with automatic token validation
 */
export async function apiPost<T = any>(
  url: string, 
  body: any, 
  headers?: Record<string, string>
): Promise<T> {
  return apiCall<T>(url, { method: 'POST', body, headers });
}

/**
 * Makes a PUT request with automatic token validation
 */
export async function apiPut<T = any>(
  url: string, 
  body: any, 
  headers?: Record<string, string>
): Promise<T> {
  return apiCall<T>(url, { method: 'PUT', body, headers });
}

/**
 * Makes a PATCH request with automatic token validation
 */
export async function apiPatch<T = any>(
  url: string, 
  body: any, 
  headers?: Record<string, string>
): Promise<T> {
  return apiCall<T>(url, { method: 'PATCH', body, headers });
}

/**
 * Makes a DELETE request with automatic token validation
 */
export async function apiDelete<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
  return apiCall<T>(url, { method: 'DELETE', headers });
}

/**
 * Makes a POST request with FormData (for file uploads)
 */
export async function apiPostFormData<T = any>(
  url: string, 
  formData: FormData, 
  headers?: Record<string, string>
): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      ...headers,
    },
    body: formData,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, requestOptions);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear the access token cookie
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Redirect to login with session expired message
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('session_expired', 'true');
      window.location.href = loginUrl.toString();
      
      // Throw an error to stop execution
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData: ApiResponse = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
      }));
      
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data.data || data as T;
  } catch (error) {
    // Re-throw session expired errors
    if (error instanceof Error && error.message === 'Session expired') {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    
    // Re-throw other errors
    throw error;
  }
} 