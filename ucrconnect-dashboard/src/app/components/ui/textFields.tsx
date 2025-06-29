interface TextFieldProps {
  id: string;
  label: string;
  type?: string;
  name?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function TextField({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error,
  readOnly = false,
  required = false,
  placeholder = "",
  className = "",
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#249dd8] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 ring-red-300"
              : "border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]"
          }
          ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "text-gray-800"}
          ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
