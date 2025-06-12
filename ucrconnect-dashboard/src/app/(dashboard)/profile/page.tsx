'use client'

import { useEffect, useState } from 'react'
import { fetchProfileFromApiRoute, updateProfile } from '@/lib/profileApi'
import { auth } from '@/lib/firebase'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { getProfileValidationErrors } from '@/lib/validation/profile'
import { ProfileHeader } from '@/components/profile/profileHeader'
import { ProfileForm } from '@/components/profile/profileForm'
import { PasswordFields } from '@/components/profile/passwordFields'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [successProfileMsg, setSuccessProfileMsg] = useState('')
  const [successPasswordMsg, setSuccessPasswordMsg] = useState('')
  const [errorProfileMsg, setErrorProfileMsg] = useState('')
  const [errorPasswordMsg, setErrorPasswordMsg] = useState('')

  useEffect(() => {
    fetchProfileFromApiRoute()
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          full_name: data.full_name || '',
          email: data.email || '',
          username: data.username || '',
        }))
        if (data.profile_picture) {
          setProfileImage(data.profile_picture)
        }
      })
      .catch((err) => {
        console.error('Error loading profile:', err)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]))
      setProfileImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    const validationErrors = getProfileValidationErrors(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSuccessProfileMsg('')
      setSuccessPasswordMsg('')
      return
    }

    setSuccessProfileMsg('')
    setSuccessPasswordMsg('')
    setErrorProfileMsg('')
    setErrorPasswordMsg('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('full_name', formData.full_name)
      if (profileImageFile) {
        formDataToSend.append('profile_picture', profileImageFile)
      }

      await updateProfile(formDataToSend)
      setSuccessProfileMsg('Información del perfil actualizada correctamente.')
      setTimeout(() => setSuccessProfileMsg(''), 3000)
      setProfileImageFile(null)
    } catch (err) {
      setErrorProfileMsg('Error al actualizar la información del perfil.')
      setTimeout(() => setErrorProfileMsg(''), 3000)
    }

    if (formData.currentPassword && formData.newPassword) {
      try {
        const user = auth.currentUser
        if (!user || !user.email) throw new Error('No user')

        const credential = EmailAuthProvider.credential(user.email, formData.currentPassword)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, formData.newPassword)

        setSuccessPasswordMsg('Contraseña actualizada correctamente.')
        setTimeout(() => setSuccessPasswordMsg(''), 3000)

        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      } catch (err: any) {
        const msg = err.code === 'auth/wrong-password'
          ? 'La contraseña actual es incorrecta.'
          : 'Error al cambiar la contraseña.'

        setErrorPasswordMsg(msg)
        setTimeout(() => setErrorPasswordMsg(''), 3000)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-10">
      <ProfileHeader profileImage={profileImage} formData={formData} onImageChange={handleImageChange} />
      <hr className="text-gray-450 mb-10" />
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">Editar información</h3>
      <h4 className="text-lg font-semibold text-gray-700 mb-4">Información del perfil</h4>
      <ProfileForm profileImage={profileImage} formData={formData} errors={errors} onChange={handleChange} onImageChange={handleImageChange}/>
      <h4 className="text-lg font-semibold text-gray-700 mb-4">Cambiar contraseña</h4>
      <PasswordFields formData={formData} errors={errors} onChange={handleChange} />
      <div className="mt-6 flex flex-col items-center space-y-3">
        <button
          onClick={handleSubmit}
          className="bg-[#249dd8] text-white px-10 py-3 rounded-full shadow hover:bg-[#1b87b9] transition"
        >
          Guardar cambios
        </button>

        {/* Mensajes de éxito */}
        {successProfileMsg && <p className="text-green-600 font-medium">{successProfileMsg}</p>}
        {successPasswordMsg && <p className="text-green-600 font-medium">{successPasswordMsg}</p>}

        {/* Mensajes de error */}
        {errorProfileMsg && <p className="text-red-600 font-medium">{errorProfileMsg}</p>}
        {errorPasswordMsg && <p className="text-red-600 font-medium">{errorPasswordMsg}</p>}
      </div>
    </div>
  )
}
