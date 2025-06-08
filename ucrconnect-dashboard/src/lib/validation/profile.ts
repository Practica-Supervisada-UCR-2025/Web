import { getPasswordValidationErrors } from './password'

export function getProfileValidationErrors(formData: any): { [key: string]: string } {
  const errors: { [key: string]: string } = {}

  if (!formData.full_name.trim()) {
    errors.full_name = 'El nombre completo es obligatorio.'
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(formData.full_name)) {
    errors.full_name = 'Debe contener al menos 2 letras y solo puede tener letras y espacios.'
  }

  // Validar cambio de contraseña
  if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
    if (!formData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es obligatoria.'
    }

    if (!formData.newPassword) {
      errors.newPassword = 'La nueva contraseña es obligatoria.'
    } else {
      const passwordIssues = getPasswordValidationErrors(formData.newPassword)
      if (passwordIssues.length > 0) {
        errors.newPassword = passwordIssues.join(' ')
      }
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.'
    }
  }

  return errors
}

export function isProfileValid(formData: any): boolean {
  return Object.keys(getProfileValidationErrors(formData)).length === 0
}
