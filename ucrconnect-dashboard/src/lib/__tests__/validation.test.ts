import { validateProfile } from '../validations'

describe('validateProfile', () => {
  it('returns no errors when all fields are valid and no password change', () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }

    const result = validateProfile(formData)
    expect(result).toEqual({})
  })

  it('validates required first and last name', () => {
    const formData = {
      firstName: ' ',
      lastName: '',
    }

    const result = validateProfile(formData)
    expect(result.firstName).toBe('El nombre es obligatorio.')
    expect(result.lastName).toBe('Los apellidos son obligatorios.')
  })

  it('validates invalid first and last name format', () => {
    const formData = {
      firstName: 'J1',
      lastName: 'D@',
    }

    const result = validateProfile(formData)
    expect(result.firstName).toBe('El nombre debe tener al menos 2 caracteres y solo debe contener letras.')
    expect(result.lastName).toBe('El apellido debe tener al menos 2 caracteres y solo debe contener letras.')
  })

  it('validates password fields: current missing', () => {
    const formData = {
      firstName: 'Jane',
      lastName: 'Doe',
      newPassword: '123456',
      confirmPassword: '123456',
    }

    const result = validateProfile(formData)
    expect(result.currentPassword).toBe('La contraseña actual es obligatoria.')
  })

  it('validates new password length and confirmation mismatch', () => {
    const formData = {
      firstName: 'Jane',
      lastName: 'Doe',
      currentPassword: 'oldpass',
      newPassword: '123',
      confirmPassword: '321',
    }

    const result = validateProfile(formData)
    expect(result.newPassword).toBe('La nueva contraseña debe tener al menos 6 caracteres.')
    expect(result.confirmPassword).toBe('Las contraseñas no coinciden.')
  })

  it('returns no errors when password change is valid', () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    }

    const result = validateProfile(formData)
    expect(result).toEqual({})
  })
})
