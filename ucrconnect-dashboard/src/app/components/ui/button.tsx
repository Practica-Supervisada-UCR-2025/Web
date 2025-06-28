'use client';

import React from 'react';

type ButtonProps = {
  onClick?: () => void;
  type: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  isLoading: boolean;
  disabled: boolean;
  className?: string;
};

export function Button({
  onClick,
  type,
  children,
  isLoading,
  disabled,
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`px-10 py-3 rounded-xl shadow text-white transition
                  bg-[#249dd8] hover:bg-[#1b87b9] disabled:opacity-50 
                  disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  );
}
