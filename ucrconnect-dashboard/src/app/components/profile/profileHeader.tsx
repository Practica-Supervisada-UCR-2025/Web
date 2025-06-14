export function ProfileHeader({
  profileImage,
  formData,
  onImageChange,
}: {
  profileImage: string
  formData: { full_name: string; email: string }
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center space-x-6 mb-10">
      <div className="relative group mb-4 sm:mb-0">
        <img
          src={profileImage}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover object-center border-4 border-[#249dd8] shadow-md"
        />
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
          {formData.full_name || ''}
        </h2>
        <p className="text-gray-600 mt-1">{formData.email}</p>
      </div>
    </div>
  )
}