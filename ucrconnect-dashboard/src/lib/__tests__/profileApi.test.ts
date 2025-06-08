import { fetchProfileFromApiRoute, updateProfile } from '@/lib/profileApi'

describe('profileApi utilities', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.resetAllMocks()
  })

  describe('fetchProfileFromApiRoute', () => {
    it('should return profile data when the request is successful', async () => {
      const mockProfile = { id: '123', name: 'Admin' }
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockProfile }),
      }) as unknown as typeof fetch

      const data = await fetchProfileFromApiRoute()

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth/profile')
      expect(data).toEqual(mockProfile)
    })

    it('should throw an error when the request is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
      }) as unknown as typeof fetch

      await expect(fetchProfileFromApiRoute()).rejects.toThrow('Error fetching profile')
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
  })
})
