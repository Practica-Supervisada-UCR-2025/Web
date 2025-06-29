import { useCallback } from 'react';
import { apiCall, apiGet, apiPost, apiPut, apiPatch, apiDelete, apiPostFormData } from '@/lib/apiUtils';

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

/**
 * Custom hook for API calls with automatic token validation
 */
export function useApi() {
  const call = useCallback(async <T = any>(
    url: string, 
    options: ApiCallOptions = {}
  ): Promise<T> => {
    return apiCall<T>(url, options);
  }, []);

  const get = useCallback(async <T = any>(
    url: string, 
    headers?: Record<string, string>
  ): Promise<T> => {
    return apiGet<T>(url, headers);
  }, []);

  const post = useCallback(async <T = any>(
    url: string, 
    body: any, 
    headers?: Record<string, string>
  ): Promise<T> => {
    return apiPost<T>(url, body, headers);
  }, []);

  const put = useCallback(async <T = any>(
    url: string, 
    body: any, 
    headers?: Record<string, string>
  ): Promise<T> => {
    return apiPut<T>(url, body, headers);
  }, []);

  const patch = useCallback(async <T = any>(
    url: string, 
    body: any, 
    headers?: Record<string, string>
  ): Promise<T> => {
    return apiPatch<T>(url, body, headers);
  }, []);

  const del = useCallback(async <T = any>(
    url: string, 
    headers?: Record<string, string>
  ): Promise<T> => {
    return apiDelete<T>(url, headers);
  }, []);

  const postFormData = useCallback(async <T = any>(
    url: string, 
    formData: FormData, 
    headers?: Record<string, string>
  ): Promise<T> => {
    return apiPostFormData<T>(url, formData, headers);
  }, []);

  return {
    call,
    get,
    post,
    put,
    patch,
    delete: del,
    postFormData,
  };
} 