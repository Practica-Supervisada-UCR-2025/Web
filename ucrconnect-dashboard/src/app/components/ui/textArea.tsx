interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  readOnly = false,
  required = false,
  className = "",
  rows = 4,
}: TextAreaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#249dd8] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={readOnly}
        required={required}
        rows={rows}
        className={`w-full border rounded-xl px-4 py-2 resize-y focus:outline-none
          ${
            error
              ? "border-red-500 ring-red-300"
              : "border-gray-300"
          }
          ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "text-gray-800"}
          ${
            !readOnly && !error
              ? "focus:ring-2 focus:ring-[#249dd8] focus:border-[#249dd8]"
              : ""
          }
          ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
