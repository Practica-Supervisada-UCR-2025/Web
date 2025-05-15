'use client'
import { useEffect, useState } from 'react'
import { fetchProfile } from '@/lib/mockApi'
import { Pencil } from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  username: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120')

  useEffect(() => {
    fetchProfile().then((res: any) => {
      const nameParts = res.data.full_name.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ')

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: res.data.email,
        username: res.data.email.split('@')[0],
      }))
      setProfileImage(res.data.profile_picture || 'https://via.placeholder.com/120')
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0])
      setProfileImage(imageUrl)
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'El nombre es obligatorio.'
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(formData.firstName)) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres y solo debe contener letras.'
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Los apellidos son obligatorios.'
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(formData.lastName)) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres y solo debe contener letras.'
    }

    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'La contraseña actual es obligatoria.'
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'La nueva contraseña es obligatoria.'
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres.'
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden.'
      }
    }

    return newErrors
  }

  const handleSubmit = () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSuccessMessage('')
    } else {
      setErrors({})
      setSuccessMessage('Los cambios se guardaron correctamente.')
      setTimeout(() => setSuccessMessage(''), 3000)

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-10">
      <div className="flex flex-col sm:flex-row items-center space-x-6 mb-10">
        <div className="relative group mb-4 sm:mb-0">
          <img
            src={profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#249dd8] shadow-md"
          />
          <div className="absolute bottom-0 right-0 bg-white border shadow-md rounded-full p-1">
            <label htmlFor="profileImage" className="cursor-pointer">
              <Pencil className="w-5 h-5 text-[#249dd8]" />
            </label>
          </div>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#249dd8]">
            {formData.firstName && formData.lastName
              ? `${formData.firstName} ${formData.lastName}`
              : 'Nombre completo'}
          </h2>
          <p className="text-gray-600 mt-1">{formData.email}</p>
        </div>
      </div>

      <hr className="my-8" />

      <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">Editar información</h3>

      <h4 className="text-lg font-semibold text-gray-700 mb-4">Información de usuario</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Nombre */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#249dd8] mb-1">Nombre</label>
          <div className="relative">
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              placeholder="Nombre"
              className={`peer w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.firstName
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
              } text-gray-800`}
            />
            <Pencil className="absolute top-1/2 right-3 -translate-y-1/2 text-[#249dd8] w-4 h-4 pointer-events-none" />
          </div>
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        {/* Apellidos */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#249dd8] mb-1">Apellidos</label>
          <div className="relative">
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              placeholder="Apellidos"
              className={`peer w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.lastName
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
              } text-gray-800`}
            />
            <Pencil className="absolute top-1/2 right-3 -translate-y-1/2 text-[#249dd8] w-4 h-4 pointer-events-none" />
          </div>
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#249dd8] mb-1">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-[#249dd8] mb-1">Usuario</label>
          <input
            type="text"
            name="username"
            value={formData.username || ''}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Cambio de contraseña */}
      <h4 className="text-lg font-semibold text-gray-700 mb-4">Cambiar contraseña</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
          <div key={field} className="relative">
            <label className="block text-sm font-semibold text-[#249dd8] mb-1">
              {{
                currentPassword: 'Contraseña actual',
                newPassword: 'Nueva contraseña',
                confirmPassword: 'Confirmar contraseña',
              }[field]}
            </label>
            <input
              type="password"
              name={field}
              value={formData[field as keyof FormData] || ''}
              onChange={handleChange}
              className={`peer w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors[field]
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
              } text-gray-800`}
            />
            {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center space-y-3">
        <button onClick={handleSubmit} className="bg-[#249dd8] text-white px-10 py-3 rounded-full shadow hover:bg-[#1b87b9] transition">
          Guardar cambios
        </button>
        {successMessage && <p className="text-green-600 font-medium">{successMessage}</p>}
      </div>
    </div>
  )
}
