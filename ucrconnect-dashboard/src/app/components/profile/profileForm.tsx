export function ProfileForm({ formData, errors, onChange }: {
  formData: any
  errors: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {/* Nombre */}
      <div className="relative">
        <label htmlFor="firstName" className="block text-sm font-semibold text-[#249dd8] mb-1">
          Nombre
        </label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={onChange}
          className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
            errors.firstName
              ? 'border-red-500 ring-red-300'
              : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
          } text-gray-800`}
        />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
      </div>

      {/* Apellidos */}
      <div className="relative">
        <label htmlFor="lastName" className="block text-sm font-semibold text-[#249dd8] mb-1">
          Apellidos
        </label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={onChange}
          className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
            errors.lastName
              ? 'border-red-500 ring-red-300'
              : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
          } text-gray-800`}
        />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
      </div>

      {/* Email */}
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

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-[#249dd8] mb-1">
          Usuario
        </label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          readOnly
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>
    </div>
  )
}
