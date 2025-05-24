import { fetchProfile } from '../mockApi'

describe('fetchProfile', () => {
  const mockProfileData = { name: 'Admin', email: 'admin@example.com' }

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockProfileData),
      })
    ) as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches profile data and returns expected response structure', async () => {
    const response = await fetchProfile()

    expect(global.fetch).toHaveBeenCalledWith('/data/profile.json')
    expect(response).toEqual({
      message: 'Admin profile retrieved successfully',
      data: mockProfileData,
    })
  })
})