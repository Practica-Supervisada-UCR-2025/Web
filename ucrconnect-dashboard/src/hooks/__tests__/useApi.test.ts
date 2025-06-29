import { renderHook, act } from '@testing-library/react';
import { useApi } from '../useApi';

// Mock the apiUtils module
jest.mock('@/lib/apiUtils', () => ({
  apiCall: jest.fn(),
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
  apiPostFormData: jest.fn(),
}));

import * as apiUtils from '@/lib/apiUtils';

describe('useApi hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call apiCall with correct arguments for call()', async () => {
    const mockResult = { foo: 'bar' };
    (apiUtils.apiCall as jest.Mock).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useApi());

    let data;
    await act(async () => {
      data = await result.current.call('/test-url', { method: 'POST', body: { a: 1 } });
    });

    expect(apiUtils.apiCall).toHaveBeenCalledWith('/test-url', { method: 'POST', body: { a: 1 } });
    expect(data).toEqual(mockResult);
  });

  it('should call apiGet with correct arguments for get()', async () => {
    const mockResult = { foo: 'bar' };
    (apiUtils.apiGet as jest.Mock).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useApi());

    let data;
    await act(async () => {
      data = await result.current.get('/test-url', { Authorization: 'Bearer token' });
    });

    expect(apiUtils.apiGet).toHaveBeenCalledWith('/test-url', { Authorization: 'Bearer token' });
    expect(data).toEqual(mockResult);
  });

  it('should call apiPost with correct arguments for post()', async () => {
    const mockResult = { foo: 'bar' };
    (apiUtils.apiPost as jest.Mock).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useApi());

    let data;
    await act(async () => {
      data = await result.current.post('/test-url', { a: 1 }, { Authorization: 'Bearer token' });
    });

    expect(apiUtils.apiPost).toHaveBeenCalledWith('/test-url', { a: 1 }, { Authorization: 'Bearer token' });
    expect(data).toEqual(mockResult);
  });

  it('should call apiPut with correct arguments for put()', async () => {
    const mockResult = { foo: 'bar' };
    (apiUtils.apiPut as jest.Mock).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useApi());

    let data;
    await act(async () => {
      data = await result.current.put('/test-url', { a: 1 }, { Authorization: 'Bearer token' });
    });

    expect(apiUtils.apiPut).toHaveBeenCalledWith('/test-url', { a: 1 }, { Authorization: 'Bearer token' });
    expect(data).toEqual(mockResult);
  });

  it('should call apiPatch with correct arguments for patch()', async () => {
    const mockResult = { foo: 'bar' };
    (apiUtils.apiPatch as jest.Mock).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useApi());

    let data;
    await act(async () => {
      data = await result.current.patch('/test-url', { a: 1 }, { Authorization: 'Bearer token' });
    });

    expect(apiUtils.apiPatch).toHaveBeenCalledWith('/test-url', { a: 1 }, { Authorization: 'Bearer token' });
    expect(data).toEqual(mockResult);
  });

  it('should call apiDelete with correct arguments for delete()', async () => {
    const mockResult = { foo: 'bar' };
    (apiUtils.apiDelete as jest.Mock).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useApi());

    let data;
    await act(async () => {
      data = await result.current.delete('/test-url', { Authorization: 'Bearer token' });
    });

    expect(apiUtils.apiDelete).toHaveBeenCalledWith('/test-url', { Authorization: 'Bearer token' });
    expect(data).toEqual(mockResult);
  });

  it('should call apiPostFormData with correct arguments for postFormData()', async () => {
    const mockResult = { foo: 'bar' };
    (apiUtils.apiPostFormData as jest.Mock).mockResolvedValue(mockResult);
    const { result } = renderHook(() => useApi());

    const formData = new FormData();
    formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');

    let data;
    await act(async () => {
      data = await result.current.postFormData('/test-url', formData, { Authorization: 'Bearer token' });
    });

    expect(apiUtils.apiPostFormData).toHaveBeenCalledWith('/test-url', formData, { Authorization: 'Bearer token' });
    expect(data).toEqual(mockResult);
  });

  it('should propagate errors thrown by the apiUtils functions', async () => {
    const error = new Error('API error');
    (apiUtils.apiCall as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useApi());

    await expect(result.current.call('/fail')).rejects.toThrow('API error');
  });
}); 