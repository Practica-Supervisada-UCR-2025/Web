import { Pencil } from 'lucide-react'

export function ProfileHeader({ profileImage, formData, onImageChange }: {
  profileImage: string
  formData: { firstName: string, lastName: string, email: string }
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center space-x-6 mb-10">
      <div className="relative group mb-4 sm:mb-0">
        <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-[#249dd8] shadow-md" />
        <div className="absolute bottom-0 right-0 bg-white border shadow-md rounded-full p-1">
          <label htmlFor="profileImage" className="cursor-pointer">
            <Pencil className="w-5 h-5 text-[#249dd8]" />
          </label>
        </div>
        <input
          id="profileImage"
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
          aria-label="Subir imagen de perfil"
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#249dd8]">
          {formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Nombre completo'}
        </h2>
        <p className="text-gray-600 mt-1">{formData.email}</p>
      </div>
    </div>
  )
}