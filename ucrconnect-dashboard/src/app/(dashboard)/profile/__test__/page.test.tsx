import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from '../page'
import { getProfileValidationErrors } from '@/lib/validation/profile'

// Mocks
jest.mock('firebase/auth', () => ({
  EmailAuthProvider: {
    credential: jest.fn((email, password) => ({ email, password })),
  },
  reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: { email: 'test@example.com' }
  }
}))

jest.mock('@/lib/profileApi', () => ({
  fetchProfileFromApiRoute: jest.fn(() =>
    Promise.resolve({
      full_name: 'Sebastián Rodríguez',
      email: 'sebastian@example.com',
      username: 'sebastianr',
      profile_picture: 'https://example.com/avatar.jpg',
    })
  ),
  updateProfile: jest.fn(() => Promise.resolve()),
}))

jest.mock('@/lib/validation/profile', () => ({
  getProfileValidationErrors: jest.fn(() => ({})),
}))

jest.mock('@/components/profile/profileHeader', () => ({
  ProfileHeader: ({ profileImage }: any) => (
    <div data-testid="profile-header">Header: {profileImage}</div>
  )
}))

jest.mock('@/components/profile/profileForm', () => ({
  ProfileForm: ({ formData, onChange, errors }: any) => (
    <div>
      <input
        data-testid="profile-form-fullname"
        name="full_name"
        value={formData.full_name}
        onChange={onChange}
      />
      {errors?.full_name && <p>{errors.full_name}</p>}
    </div>
  )
}))

jest.mock('@/components/profile/passwordFields', () => ({
  PasswordFields: ({ formData, onChange, errors }: any) => (
    <div>
      <input
        data-testid="password-field-current"
        name="currentPassword"
        value={formData.currentPassword}
        onChange={onChange}
      />
      <input
        data-testid="password-field-new"
        name="newPassword"
        value={formData.newPassword}
        onChange={onChange}
      />
      {errors.currentPassword && <p>{errors.currentPassword}</p>}
    </div>
  )
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza correctamente con datos del perfil', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-header')).toHaveTextContent('https://example.com/avatar.jpg')
      expect(screen.getByTestId('profile-form-fullname')).toHaveValue('Sebastián Rodríguez')
    })
  })

  it('muestra errores si la validación falla', async () => {
    ;(getProfileValidationErrors as jest.Mock).mockReturnValueOnce({
      full_name: 'El nombre completo es obligatorio.',
    })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-fullname')).toHaveValue('Sebastián Rodríguez')
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(screen.queryByText('Información del perfil actualizada correctamente.')).not.toBeInTheDocument()
      expect(screen.getByText('El nombre completo es obligatorio.')).toBeInTheDocument()
    })
  })

  it('muestra mensaje de éxito al guardar sin errores', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-fullname')).toHaveValue('Sebastián Rodríguez')
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(screen.getByText('Información del perfil actualizada correctamente.')).toBeInTheDocument()
    })
  })

  it('reinicia campos de contraseña tras guardar', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-fullname')).toHaveValue('Sebastián Rodríguez')
    })

    const currentInput = screen.getByTestId('password-field-current')
    const newInput = screen.getByTestId('password-field-new')

    fireEvent.change(currentInput, { target: { name: 'currentPassword', value: 'test1234' } })
    fireEvent.change(newInput, { target: { name: 'newPassword', value: 'newPass123' } })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(currentInput).toHaveValue('')
      expect(newInput).toHaveValue('')
    })
  })

  it('realiza reautenticación y cambio de contraseña', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-fullname')).toHaveValue('Sebastián Rodríguez')
    })

    const currentInput = screen.getByTestId('password-field-current')
    const newInput = screen.getByTestId('password-field-new')

    fireEvent.change(currentInput, {
      target: { name: 'currentPassword', value: 'oldPass123' },
    })
    fireEvent.change(newInput, {
      target: { name: 'newPassword', value: 'newPass456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalled()
      expect(updatePassword).toHaveBeenCalled()
    })
  })

  it('muestra error si reautenticación falla', async () => {
    ;(reauthenticateWithCredential as jest.Mock).mockRejectedValueOnce({ code: 'auth/wrong-password' })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-fullname')).toHaveValue('Sebastián Rodríguez')
    })

    const currentInput = screen.getByTestId('password-field-current')
    const newInput = screen.getByTestId('password-field-new')

    fireEvent.change(currentInput, {
      target: { name: 'currentPassword', value: 'wrongPass' },
    })
    fireEvent.change(newInput, {
      target: { name: 'newPassword', value: 'newPass456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña actual es incorrecta.')).toBeInTheDocument()
    })
  })

  it('usa imagen por defecto si no hay foto de perfil', async () => {
    const mockedFetch = require('@/lib/profileApi').fetchProfileFromApiRoute
    mockedFetch.mockResolvedValueOnce({
      full_name: 'Ana Torres',
      email: 'ana@example.com',
      username: 'anatorres',
      profile_picture: '',
    })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-header')).toHaveTextContent('https://via.placeholder.com/120')
    })
  })
})
