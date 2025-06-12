import { Pencil } from 'lucide-react'

export function ProfileForm({
  formData,
  errors,
  onChange,
  onImageChange,
  profileImage,
}: {
  formData: any
  errors: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  profileImage: string
}) {
  return (
    <div className="max-w-2xl mx-auto px-10 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
        {/* Imagen de perfil */}
        <div className="relative group flex justify-center md:justify-end">
          <div>
            <img
              src={profileImage}
              alt="Imagen de perfil"
              className="w-32 h-32 rounded-full object-cover object-center border-4 border-[#249dd8] shadow-md"
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
              onChange={onImageChange}
              className="hidden"
              aria-label="Subir imagen de perfil"
            />
          </div>
        </div>

        {/* Campos a la derecha */}
        <div className="flex flex-col space-y-6">
          {/* Nombre completo */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-semibold text-[#249dd8] mb-1">
              Nombre completo
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={onChange}
              className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.full_name
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
              } text-gray-800`}
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div>

          {/* Correo electrónico */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#249dd8] mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
