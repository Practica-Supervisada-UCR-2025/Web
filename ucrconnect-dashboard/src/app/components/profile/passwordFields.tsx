import { useState } from 'react'

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword'

type PasswordFormData = {
  [key in PasswordField]: string
}

type PasswordFormErrors = {
  [key in PasswordField]?: string
}

export function PasswordFields({
  formData,
  errors,
  onChange,
}: {
  formData: PasswordFormData
  errors: PasswordFormErrors
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [showPasswords, setShowPasswords] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const togglePasswordVisibility = (field: PasswordField) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const passwordFields: PasswordField[] = ['currentPassword', 'newPassword', 'confirmPassword']

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {passwordFields.map(field => {
        const labelText = {
          currentPassword: 'Contraseña actual',
          newPassword: 'Nueva contraseña',
          confirmPassword: 'Confirmar contraseña',
        }[field]

        const isVisible = showPasswords[field]

        return (
          <div key={field} className="relative">
            <label
              htmlFor={field}
              className="block text-sm font-semibold text-[#249dd8] mb-1"
            >
              {labelText}
            </label>
            <div className="relative">
              <input
                id={field}
                type={isVisible ? 'text' : 'password'}
                name={field}
                value={formData[field]}
                onChange={onChange}
                className={`w-full border rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                  errors[field]
                    ? 'border-red-500 ring-red-300'
                    : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
                } text-gray-800`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {isVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {errors[field] && (
              <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
