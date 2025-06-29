'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RecoverPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el correo
    const emailRegex = /^[^\s@]+@ucr\.ac\.cr$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }

    setError(''); 

    try {
      const response = await fetch("/api/admin/auth/recoverpassword", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Correo enviado exitosamente.');
      } else {
        setError('Hubo un problema al enviar el correo.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="relative w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
      <div className="absolute -top-20 left-0 right-0 flex justify-center items-center h-32">
        <img src="/images/logos/login.svg" alt="UCRConnect" className="w-24 h-24 object-contain" />
      </div>
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold text-[#204C6F]">UCR Connect</h1>
        <p className="mt-2 text-gray-700">Recupera tu contraseña</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="text-green-500 text-sm text-center">
            {message}
          </div>
        )}
        <div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2980B9] focus:border-[#2980B9] dark:text-[#0C344E]"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-[#204C6F] to-[#2980B9] hover:from-[#1a3d58] hover:to-[#226a96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Recuperar contraseña
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <Link href="/login" className="text-sm text-[#2980B9] hover:text-[#226a96]">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}