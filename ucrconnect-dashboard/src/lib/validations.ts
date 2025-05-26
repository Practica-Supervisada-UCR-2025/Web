export function validateProfile(formData: any) {
  const errors: { [key: string]: string } = {}

  if (!formData.firstName.trim()) {
    errors.firstName = 'El nombre es obligatorio.'
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(formData.firstName)) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres y solo debe contener letras.'
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Los apellidos son obligatorios.'
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(formData.lastName)) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres y solo debe contener letras.'
  }

  if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
    if (!formData.currentPassword) errors.currentPassword = 'La contraseña actual es obligatoria.'
    if (!formData.newPassword) {
      errors.newPassword = 'La nueva contraseña es obligatoria.'
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres.'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.'
    }
  }

  return errors
}
