import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  id: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({ label, id, value, options, onChange, disabled, className }: DropdownProps) {
  const inputClass = `w-full rounded-xl px-4 py-2 text-sm border border-gray-300
    focus:outline-none focus:ring-2 focus:ring-[#249dd8] focus:border-[#249dd8]
    text-gray-800 shadow-sm appearance-none
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
  `;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#249dd8] mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-10 ${className || ''}`}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
