/* __test__/profileApi.test.ts */
import { fetchProfileFromApiRoute, updateProfile } from '@/lib/profileApi'

// Mock the API utilities
jest.mock('@/lib/apiUtils', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
}))

import { apiGet } from '@/lib/apiUtils'

describe('profileApi utilities', () => {
  const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchProfileFromApiRoute', () => {
    it('should return profile data when the request is successful', async () => {
      const mockProfile = { id: '123', name: 'Admin' }
      mockApiGet.mockResolvedValue(mockProfile)

      const data = await fetchProfileFromApiRoute()

      expect(mockApiGet).toHaveBeenCalledWith('/api/admin/auth/profile')
      expect(data).toEqual(mockProfile)
    })

    it('should throw an error when the request is not ok', async () => {
      mockApiGet.mockRejectedValue(new Error('Session expired'))

      await expect(fetchProfileFromApiRoute()).rejects.toThrow('Session expired')
    })
  })

  describe('updateProfile', () => {
    it('should send a PATCH request and return updated data on success', async () => {
      const mockUpdatedProfile = { id: '123', name: 'Admin Updated' }
      
      // Mock the fetch call directly since updateProfile still uses fetch
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
  })
})

/* components/__test__/profile/profileHeader.test.tsx */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileHeader } from '../../profile/profileHeader'

describe('ProfileHeader', () => {
  const defaultProps = {
    profileImage: 'https://example.com/avatar.jpg',
    formData: { full_name: 'John Doe', email: 'john@example.com' },
    onImageChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the profile image with correct src and alt', () => {
    render(<ProfileHeader {...defaultProps} />)

    const image = screen.getByAltText(/profile/i) as HTMLImageElement
    expect(image).toBeInTheDocument()
    expect(image.src).toBe(defaultProps.profileImage)
    expect(image.className).toContain('rounded-full')
  })

  it('renders the user full name and email', () => {
    render(<ProfileHeader {...defaultProps} />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('John Doe')
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders empty name when full_name is missing', () => {
    render(
      <ProfileHeader
        profileImage="https://example.com/avatar.jpg"
        formData={{ full_name: '', email: 'john@example.com' }}
        onImageChange={jest.fn()}
      />
    )

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('')
  })

  it('triggers onImageChange when a new image is selected', () => {
    render(<ProfileHeader {...defaultProps} />)

    const fileInput = screen.getByLabelText(/subir imagen de perfil/i) as HTMLInputElement

    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(defaultProps.onImageChange).toHaveBeenCalledTimes(1)
  })
})

/* components/__test__/profile/profileForm.test.tsx */
import { ProfileForm } from '../../profile/profileForm'

describe('ProfileForm', () => {
  const defaultProps = {
    profileImage: 'https://example.com/image.jpg',
    formData: { full_name: 'Jane Doe', email: 'jane@example.com' },
    errors: {},
    onChange: jest.fn(),
    onImageChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders profile image and pencil icon', () => {
    render(<ProfileForm {...defaultProps} />)
    expect(screen.getByAltText(/imagen de perfil/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subir imagen de perfil/i)).toBeInTheDocument()
  })

  it('renders full_name input and updates on change', () => {
    render(<ProfileForm {...defaultProps} />)
    const input = screen.getByLabelText(/nombre completo/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Jane Doe')

    fireEvent.change(input, { target: { value: 'New Name' } })
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1)
  })

  it('shows error message when full_name has an error', () => {
    const propsWithError = {
      ...defaultProps,
      errors: { full_name: 'El nombre es obligatorio' },
    }
    render(<ProfileForm {...propsWithError} />)
    expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument()
  })

  it('renders email input as readOnly and prefilled', () => {
    render(<ProfileForm {...defaultProps} />)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveValue('jane@example.com')
    expect(emailInput).toHaveAttribute('readOnly')
  })

  it('triggers onImageChange when file is selected', () => {
    render(<ProfileForm {...defaultProps} />)
    const fileInput = screen.getByLabelText(/subir imagen de perfil/i)
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(defaultProps.onImageChange).toHaveBeenCalledTimes(1)
  })
})
