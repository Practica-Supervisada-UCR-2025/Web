import {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiPostFormData,
} from '../apiUtils';

describe('apiUtils', () => {
  const originalFetch = global.fetch;
  const originalLocation = window.location;
  let mockLocation: { href: string; origin: string };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation = { href: '', origin: 'http://localhost:3000' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    document.cookie = '';
  });

  describe('apiCall', () => {
    it('should return data on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      const data = await apiCall('/api/test', { method: 'GET' });
      expect(data).toEqual({ foo: 'bar' });
    });

    it('should throw error with message from server on error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Bad request' }),
      });
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('Bad request');
    });

    it('should throw error with status if no message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('fail')),
      });
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle 401 and redirect to login', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
      });
      const cookieSetter = jest.fn();
      Object.defineProperty(document, 'cookie', {
        set: cookieSetter,
        get: () => '',
        configurable: true,
      });
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('Session expired');
      expect(cookieSetter).toHaveBeenCalledWith('access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');
      expect(mockLocation.href).toBe('http://localhost:3000/login?session_expired=true');
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('Error de conexión. Verifique su conexión a internet.');
    });

    it('should not set body if body is not provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      await apiCall('/api/test', { method: 'GET' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'GET',
      }));
      // Should not have a body property
      expect((global.fetch as jest.Mock).mock.calls[0][1]).not.toHaveProperty('body');
    });

    it('should not set body if body is falsy values', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      
      // Test various falsy values
      await apiCall('/api/test', { method: 'POST', body: null });
      await apiCall('/api/test', { method: 'POST', body: undefined });
      await apiCall('/api/test', { method: 'POST', body: 0 });
      await apiCall('/api/test', { method: 'POST', body: false });
      await apiCall('/api/test', { method: 'POST', body: '' });
      
      // All calls should not have a body property
      const calls = (global.fetch as jest.Mock).mock.calls;
      calls.forEach(call => {
        expect(call[1]).not.toHaveProperty('body');
      });
    });

    it('should set body when body is provided as truthy value', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      
      await apiCall('/api/test', { method: 'POST', body: { test: 'data' } });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      }));
    });

    it('should use fallback error message if response.json throws', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        json: jest.fn().mockRejectedValue(new Error('fail')),
      });
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('HTTP error! status: 418');
    });

    it('should use fallback error string if errorData.message and errorData.error are missing', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        json: jest.fn().mockResolvedValue({}),
      });
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('HTTP error! status: 418');
    });

    it('should use errorData.error if message is missing', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        json: jest.fn().mockResolvedValue({ error: 'Some error' }),
      });
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('Some error');
    });

    it('should use errorData.error if message is empty string', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        json: jest.fn().mockResolvedValue({ message: '', error: 'Some error' }),
      });
      await expect(apiCall('/api/test', { method: 'GET' })).rejects.toThrow('Some error');
    });

    it('should return data directly if data.data is not present', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ foo: 'bar' }),
      });
      const data = await apiCall('/api/test', { method: 'GET' });
      expect(data).toEqual({ foo: 'bar' });
    });
  });

  describe('apiGet', () => {
    it('should call apiCall with GET method', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      const data = await apiGet('/api/test', { Authorization: 'Bearer token' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
        credentials: 'include',
      });
      expect(data).toEqual({ foo: 'bar' });
    });
  });

  describe('apiPost', () => {
    it('should call apiCall with POST method', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      const data = await apiPost('/api/test', { a: 1 }, { Authorization: 'Bearer token' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
        body: JSON.stringify({ a: 1 }),
        credentials: 'include',
      });
      expect(data).toEqual({ foo: 'bar' });
    });
  });

  describe('apiPut', () => {
    it('should call apiCall with PUT method', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      const data = await apiPut('/api/test', { a: 1 }, { Authorization: 'Bearer token' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
        body: JSON.stringify({ a: 1 }),
        credentials: 'include',
      });
      expect(data).toEqual({ foo: 'bar' });
    });
  });

  describe('apiPatch', () => {
    it('should call apiCall with PATCH method', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      const data = await apiPatch('/api/test', { a: 1 }, { Authorization: 'Bearer token' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
        body: JSON.stringify({ a: 1 }),
        credentials: 'include',
      });
      expect(data).toEqual({ foo: 'bar' });
    });
  });

  describe('apiDelete', () => {
    it('should call apiCall with DELETE method', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      const data = await apiDelete('/api/test', { Authorization: 'Bearer token' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
        credentials: 'include',
      });
      expect(data).toEqual({ foo: 'bar' });
    });
  });

  describe('apiPostFormData', () => {
    it('should return data on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: { foo: 'bar' } }),
      });
      const formData = new FormData();
      formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
      const data = await apiPostFormData('/api/test', formData, { Authorization: 'Bearer token' });
      expect(data).toEqual({ foo: 'bar' });
    });

    it('should throw error with message from server on error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Bad request' }),
      });
      const formData = new FormData();
      await expect(apiPostFormData('/api/test', formData)).rejects.toThrow('Bad request');
    });

    it('should throw error with status if no message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('fail')),
      });
      const formData = new FormData();
      await expect(apiPostFormData('/api/test', formData)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle 401 and redirect to login', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
      });
      const cookieSetter = jest.fn();
      Object.defineProperty(document, 'cookie', {
        set: cookieSetter,
        get: () => '',
        configurable: true,
      });
      const formData = new FormData();
      await expect(apiPostFormData('/api/test', formData)).rejects.toThrow('Session expired');
      expect(cookieSetter).toHaveBeenCalledWith('access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');
      expect(mockLocation.href).toBe('http://localhost:3000/login?session_expired=true');
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      const formData = new FormData();
      await expect(apiPostFormData('/api/test', formData)).rejects.toThrow('Error de conexión. Verifique su conexión a internet.');
    });

    it('should use fallback error string if errorData.message and errorData.error are missing (apiPostFormData)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        json: jest.fn().mockResolvedValue({}),
      });
      const formData = new FormData();
      await expect(apiPostFormData('/api/test', formData)).rejects.toThrow('HTTP error! status: 418');
    });

    it('should use errorData.error if message is missing (apiPostFormData)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        json: jest.fn().mockResolvedValue({ error: 'Some error' }),
      });
      const formData = new FormData();
      await expect(apiPostFormData('/api/test', formData)).rejects.toThrow('Some error');
    });

    it('should use errorData.error if message is empty string (apiPostFormData)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 418,
        json: jest.fn().mockResolvedValue({ message: '', error: 'Some error' }),
      });
      const formData = new FormData();
      await expect(apiPostFormData('/api/test', formData)).rejects.toThrow('Some error');
    });

    it('should return data directly if data.data is not present (apiPostFormData)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ foo: 'bar' }),
      });
      const formData = new FormData();
      const data = await apiPostFormData('/api/test', formData);
      expect(data).toEqual({ foo: 'bar' });
    });
  });
});