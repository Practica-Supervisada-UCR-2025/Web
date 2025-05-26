import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from '../page'
import { validateProfile } from '@/lib/validations'

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

jest.mock('@/lib/mockApi', () => ({
  fetchProfile: jest.fn(() =>
    Promise.resolve({
      data: {
        full_name: 'Sebastián Rodríguez',
        email: 'sebastian@example.com',
        profile_picture: 'https://example.com/avatar.jpg'
      }
    })
  )
}))

jest.mock('@/lib/validations', () => ({
  validateProfile: jest.fn(() => ({}))
}))

jest.mock('@/components/profile/profileHeader', () => ({
  ProfileHeader: ({ profileImage }: any) => (
    <div data-testid="profile-header">Header: {profileImage}</div>
  )
}))

jest.mock('@/components/profile/profileForm', () => ({
  ProfileForm: ({ formData, onChange }: any) => (
    <input
      data-testid="profile-form-firstname"
      name="firstName"
      value={formData.firstName}
      onChange={onChange}
    />
  )
}))

jest.mock('@/components/profile/passwordFields', () => ({
  PasswordFields: ({ formData, onChange, errors }: any) => (
    <div>
      <input
        data-testid="password-field"
        name="currentPassword"
        value={formData.currentPassword}
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
      expect(screen.getByTestId('profile-form-firstname')).toHaveValue('Sebastián')
    })
  })

  it('muestra errores si la validación falla', async () => {
    (validateProfile as jest.Mock).mockReturnValueOnce({
      firstName: 'El nombre es requerido',
    })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-firstname')).toHaveValue('Sebastián')
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(screen.queryByText('Los cambios se guardaron correctamente.')).not.toBeInTheDocument()
    })
  })

  it('muestra mensaje de éxito al guardar sin errores', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-firstname')).toHaveValue('Sebastián')
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(screen.getByText('Los cambios se guardaron correctamente.')).toBeInTheDocument()
    })
  })

  it('reinicia campos de contraseña tras guardar', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-firstname')).toHaveValue('Sebastián')
    })

    const passwordInput = screen.getByTestId('password-field')
    fireEvent.change(passwordInput, { target: { name: 'currentPassword', value: 'test1234' } })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(passwordInput).toHaveValue('')
    })
  })

  it('realiza reautenticación y cambio de contraseña', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-firstname')).toHaveValue('Sebastián')
    })

    const passwordInput = screen.getByTestId('password-field')
    fireEvent.change(passwordInput, {
      target: { name: 'currentPassword', value: 'oldPass123' },
    })

    fireEvent.change(screen.getByTestId('password-field'), {
      target: { name: 'newPassword', value: 'newPass456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalled()
      expect(updatePassword).toHaveBeenCalled()
    })
  })

  it('muestra error si reautenticación falla', async () => {
    (reauthenticateWithCredential as jest.Mock).mockRejectedValueOnce({ code: 'auth/wrong-password' })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-form-firstname')).toHaveValue('Sebastián')
    })

    fireEvent.change(screen.getByTestId('password-field'), {
      target: { name: 'currentPassword', value: 'wrongPass' },
    })

    fireEvent.change(screen.getByTestId('password-field'), {
      target: { name: 'newPassword', value: 'newPass456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña actual es incorrecta.')).toBeInTheDocument()
    })
  })
})
