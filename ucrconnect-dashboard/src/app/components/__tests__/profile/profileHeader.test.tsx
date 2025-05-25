import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProfileHeader } from '../../profile/profileHeader'

describe('ProfileHeader component', () => {
  const mockFormData = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
  }

  const mockProfileImage = 'https://example.com/profile.jpg'

  it('renders user full name and email', () => {
    render(<ProfileHeader profileImage={mockProfileImage} formData={mockFormData} onImageChange={() => {}} />)

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('juan.perez@example.com')).toBeInTheDocument()
  })

  it('renders profile image with correct src and alt', () => {
    render(<ProfileHeader profileImage={mockProfileImage} formData={mockFormData} onImageChange={() => {}} />)

    const img = screen.getByAltText('Profile') as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toBe(mockProfileImage)
  })

  it('calls onImageChange when new file is selected', () => {
    const onImageChange = jest.fn()
    render(<ProfileHeader profileImage={mockProfileImage} formData={mockFormData} onImageChange={onImageChange} />)

    const fileInput = screen.getByLabelText(/subir imagen de perfil/i)
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(onImageChange).toHaveBeenCalled()
  })

  it('renders placeholder name when firstName or lastName is missing', () => {
    render(<ProfileHeader profileImage={mockProfileImage} formData={{ firstName: '', lastName: '', email: 'test@test.com' }} onImageChange={() => {}} />)

    expect(screen.getByText('Nombre completo')).toBeInTheDocument()
  })
})
