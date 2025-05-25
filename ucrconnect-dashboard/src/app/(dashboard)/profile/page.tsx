'use client'

import { useEffect, useState } from 'react'
import { fetchProfile } from '@/lib/mockApi'
import { auth } from '@/lib/firebase'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { validateProfile } from '@/lib/validations'
import { ProfileHeader } from '@/components/profile/profileHeader'
import { ProfileForm } from '@/components/profile/profileForm'
import { PasswordFields } from '@/components/profile/passwordFields'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', username: '',
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120')

  useEffect(() => {
    fetchProfile().then((res: any) => {
      const [firstName, ...lastNameParts] = res.data.full_name.split(' ')
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName: lastNameParts.join(' '),
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
      setProfileImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = async () => {
    const validationErrors = validateProfile(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSuccessMessage('')
      return
    }

    if (formData.currentPassword && formData.newPassword) {
      try {
        const user = auth.currentUser
        if (!user || !user.email) throw new Error('No user')

        const credential = EmailAuthProvider.credential(user.email, formData.currentPassword)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, formData.newPassword)
      } catch (err: any) {
        setErrors({
          currentPassword:
            err.code === 'auth/wrong-password'
              ? 'La contraseña actual es incorrecta.'
              : 'Error al cambiar la contraseña.',
        })
        return
      }
    }

    setErrors({})
    setSuccessMessage('Los cambios se guardaron correctamente.')
    setTimeout(() => setSuccessMessage(''), 3000)
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-[#f7f7f7] shadow-xl rounded-2xl p-10">
      <ProfileHeader profileImage={profileImage} formData={formData} onImageChange={handleImageChange} />
      <hr className="my-8" />
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">Editar información</h3>
      <h4 className="text-lg font-semibold text-gray-700 mb-4">Información de usuario</h4>
      <ProfileForm formData={formData} errors={errors} onChange={handleChange} />
      <h4 className="text-lg font-semibold text-gray-700 mb-4">Cambiar contraseña</h4>
      <PasswordFields formData={formData} errors={errors} onChange={handleChange} />
      <div className="mt-6 flex flex-col items-center space-y-3">
        <button onClick={handleSubmit} className="bg-[#249dd8] text-white px-10 py-3 rounded-full shadow hover:bg-[#1b87b9] transition">
          Guardar cambios
        </button>
        {successMessage && <p className="text-green-600 font-medium">{successMessage}</p>}
      </div>
    </div>
  )
}
