'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header() {
  // Panel states
  const [openProfile, setOpenProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const res = await fetch('/api/admin/auth/profile');

        if (!res.ok) {
          throw new Error('Error al obtener perfil');
        }

        const json = await res.json();

        if (json.data && json.data.profile_picture) {
          const imageUrl = `${json.data.profile_picture}?t=${Date.now()}`;
          setProfileImage(imageUrl);
        }
      } catch (error) {
          if (process.env.NODE_ENV !== 'test') {
              console.error('Error al cargar imagen de perfil:', error);
          }
      }
    };

    fetchProfileImage();
  }, []);

  // Animation states
  const [profileVisible, setProfileVisible] = useState(false);

  // Get current path to determine section title
  const pathname = usePathname();

  // Map paths to section titles
  const getSectionTitle = () => {
    const pathTitles: Record<string, string> = {
      '/dashboard': 'Vista General',
      '/users': 'Usuarios',
      '/content': 'Contenido',
      '/analytics': 'Anal\u00EDticas',
      '/notifications': 'Notificaciones',
      '/settings': 'Configuraci\u00F3n',
      '/profile': 'Perfil'
    };

    return pathTitles[pathname] || ' ';
  };

  // Refs for the animation timeouts
  const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle opening settings and closing other panels
  const handleProfileClick = () => {
    if (openProfile) {
      setProfileVisible(false);
      profileTimeoutRef.current = setTimeout(() => {
        setOpenProfile(false);
      }, 150);
    } else {
        setOpenProfile(true);
        setTimeout(() => setProfileVisible(true), 50);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // First, try to logout from the backend
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to logout from backend');
      }

      // Then logout from Firebase
      await signOut(auth);

      // Redirect to login page with success message
      window.location.href = '/login?logout=success';
    } catch (error) {
      console.error('Error during logout:', error);
      // Redirect to login page with error message
      window.location.href = '/login?logout=error';
    }
  };

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, []);

  return (
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      {/* Section Title */}
      <div className="flex items-center">
        <h1 className="text-blue-950 text-[1.375rem] font-semibold md:ml-0 ml-10">
          {getSectionTitle()}
        </h1>
      </div>

      {/* Icon Section */}
      <div className="flex items-center gap-6">
        {/* Profile button */}
        <button
          onClick={handleProfileClick}
          className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                cursor-pointer transition-colors"
        >
          {profileImage ? (
            <img src={profileImage} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <img src="https://www.svgrepo.com/show/532363/user-alt-1.svg" className="w-2/3 h-2/3" alt="profile" />
          )}
        </button>
      </div>

      {/* Profile dropdown */}
      {openProfile && (
        <div className={`absolute top-16 right-6 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden
                transition-opacity duration-150 ${profileVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Content section */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => {
                setProfileVisible(false);
                profileTimeoutRef.current = setTimeout(() => {
                  setOpenProfile(false);
                }, 150);
              }}
              className="text-black text-sm py-2 px-4 block hover:bg-gray-100"
            >
              Ver perfil
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left text-black text-sm py-2 px-4 block hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}