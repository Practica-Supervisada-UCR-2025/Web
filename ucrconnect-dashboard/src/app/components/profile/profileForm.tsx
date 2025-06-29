import { TextField } from "@/components/ui/textFields";
import { Pencil } from "lucide-react";

export function ProfileForm({
  formData,
  errors,
  onChange,
  onImageChange,
  profileImage,
}: {
  formData: any;
  errors: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profileImage: string;
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
        <div className="flex flex-col space-y-6 rounded-xl p-6 bg-white border">
          <TextField
            id="full_name"
            label="Nombre completo"
            name="full_name"
            value={formData.full_name}
            onChange={onChange}
            error={errors.full_name}
            required
          />

          <TextField
            id="email"
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
