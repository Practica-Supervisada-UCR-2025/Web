'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const idToken = await user.getIdToken();
      
      // Exchange Firebase token for backend token
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          full_name: user.displayName || '',
          auth_id: user.uid,
          auth_token: idToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate with backend');
      }

      const { access_token } = await response.json();
      
      window.location.href = '/';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
      <div className="absolute -top-20 left-0 right-0 flex justify-center items-center h-32">
        <img src="/images/logos/login.svg" alt="UCRConnect" className="w-24 h-24 object-contain" />
      </div>
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold text-[#204C6F]">UCR Connect</h1>
        <p className="mt-2 text-gray-700">Inicie sesión en su cuenta</p>
      </div>
        
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}
        <div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2980B9] focus:border-[#2980B9] dark:text-[#0C344E]"
          />
        </div>
          
        <div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2980B9] focus:border-[#2980B9] dark:text-[#0C344E]"
          />
        </div>
          
        <div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-[#204C6F] to-[#2980B9] hover:from-[#1a3d58] hover:to-[#226a96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </form>
        
      <div className="text-center mt-4">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
          Ir al dashboard
        </Link>
      </div>
    </div>
  );
} 