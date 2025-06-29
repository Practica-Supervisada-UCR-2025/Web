import { fetchProfileFromApiRoute, updateProfile } from '@/lib/profileApi'
import { apiGet } from '@/lib/apiUtils'

// Mock the apiUtils module
jest.mock('@/lib/apiUtils', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
}))

describe('profileApi utilities', () => {
  const originalFetch = global.fetch
  const originalConsoleError = console.error

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error for navigation errors in tests
    console.error = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    console.error = originalConsoleError
  })

  describe('fetchProfileFromApiRoute', () => {
    it('should return profile data when the request is successful', async () => {
      const mockProfile = { id: '123', name: 'Admin' }
      ;(apiGet as jest.Mock).mockResolvedValue(mockProfile)

      const data = await fetchProfileFromApiRoute()

      expect(apiGet).toHaveBeenCalledWith('/api/admin/auth/profile')
      expect(data).toEqual(mockProfile)
    })

    it('should throw an error when the request is not ok', async () => {
      const errorMessage = 'Error fetching profile'
      ;(apiGet as jest.Mock).mockRejectedValue(new Error(errorMessage))

      await expect(fetchProfileFromApiRoute()).rejects.toThrow(errorMessage)
    })
  })

  describe('updateProfile', () => {
    it('should send a PATCH request and return updated data on success', async () => {
      const mockUpdatedProfile = { id: '123', name: 'Admin Updated' }
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockUpdatedProfile }),
      }) as unknown as typeof fetch

      const formData = new FormData()
      formData.append('name', 'Admin Updated')

      const data = await updateProfile(formData)

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth/profile', {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      })
      expect(data).toEqual(mockUpdatedProfile)
    })

    it('should throw an error with the message returned from the server', async () => {
      const serverErrorMessage = 'Invalid token'
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: serverErrorMessage }),
      }) as unknown as typeof fetch

      const formData = new FormData()

      await expect(updateProfile(formData)).rejects.toThrow(serverErrorMessage)
    })

    it('should throw a generic error when the server does not return a message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      }) as unknown as typeof fetch

      const formData = new FormData()

      await expect(updateProfile(formData)).rejects.toThrow('Error updating profile')
    })

    it('should handle session expiration and redirect to login', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
      }) as unknown as typeof fetch

      const formData = new FormData()

      await expect(updateProfile(formData)).rejects.toThrow('Session expired')
    })
  })
})
