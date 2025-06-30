import { apiGet, apiPatch } from './apiUtils';

export async function fetchProfileFromApiRoute() {
  const data = await apiGet('/api/admin/auth/profile');
  return data;
}

export async function updateProfile(formData: FormData) {
  const requestOptions: RequestInit = {
    method: 'PATCH',
    body: formData,
    credentials: 'include',
  };

  try {
    const response = await fetch('/api/admin/auth/profile', requestOptions);

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
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating profile');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    // Re-throw session expired errors
    if (error instanceof Error && error.message === 'Session expired') {
      throw error;
    }
    
    // Re-throw other errors
    throw error;
  }
}