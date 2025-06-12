export function isPasswordStrong(password: string): boolean {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar
  );
}

export function getPasswordValidationErrors(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Debe tener al menos 8 caracteres.");
  if (!/[A-Z]/.test(password)) errors.push("Debe incluir una letra mayúscula.");
  if (!/[a-z]/.test(password)) errors.push("Debe incluir una letra minúscula.");
  if (!/\d/.test(password)) errors.push("Debe incluir un número.");
  if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password))
    errors.push("Debe incluir un carácter especial.");

  return errors;
}