'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header() {
    // Panel states
    const [openSettings, setOpenSettings] = useState(false);
    const [openNotifications, setNotifications] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);

    // Animation states
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [notificationsVisible, setNotificationsVisible] = useState(false);
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
    const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const notificationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Function to handle opening settings and closing other panels
    const handleSettingsClick = () => {
        if (openSettings) {
            setSettingsVisible(false);
            settingsTimeoutRef.current = setTimeout(() => {
                setOpenSettings(false);
            }, 150);
        } else {
            if (openNotifications) {
                setNotificationsVisible(false);
                notificationsTimeoutRef.current = setTimeout(() => {
                    setNotifications(false);
                    setOpenSettings(true);
                    setTimeout(() => setSettingsVisible(true), 50);
                }, 150);
            } else if (openProfile) {
                setProfileVisible(false);
                profileTimeoutRef.current = setTimeout(() => {
                    setOpenProfile(false);
                    setOpenSettings(true);
                    setTimeout(() => setSettingsVisible(true), 50);
                }, 150);
            } else {
                setOpenSettings(true);
                setTimeout(() => setSettingsVisible(true), 50);
            }
        }
    };

    // Function to handle opening notifications and closing other panels
    const handleNotificationsClick = () => {
        if (openNotifications) {
            setNotificationsVisible(false);
            notificationsTimeoutRef.current = setTimeout(() => {
                setNotifications(false);
            }, 150);
        } else {
            if (openSettings) {
                setSettingsVisible(false);
                settingsTimeoutRef.current = setTimeout(() => {
                    setOpenSettings(false);
                    setNotifications(true);
                    setTimeout(() => setNotificationsVisible(true), 50);
                }, 150);
            } else if (openProfile) {
                setProfileVisible(false);
                profileTimeoutRef.current = setTimeout(() => {
                    setOpenProfile(false);
                    setNotifications(true);
                    setTimeout(() => setNotificationsVisible(true), 50);
                }, 150);
            } else {
                setNotifications(true);
                setTimeout(() => setNotificationsVisible(true), 50);
            }
        }
    };

    // Function to handle opening profile and closing other panels
    const handleProfileClick = () => {
        if (openProfile) {
            setProfileVisible(false);
            profileTimeoutRef.current = setTimeout(() => {
                setOpenProfile(false);
            }, 150);
        } else {
            if (openSettings) {
                setSettingsVisible(false);
                settingsTimeoutRef.current = setTimeout(() => {
                    setOpenSettings(false);
                    setOpenProfile(true);
                    setTimeout(() => setProfileVisible(true), 50);
                }, 150);
            } else if (openNotifications) {
                setNotificationsVisible(false);
                notificationsTimeoutRef.current = setTimeout(() => {
                    setNotifications(false);
                    setOpenProfile(true);
                    setTimeout(() => setProfileVisible(true), 50);
                }, 150);
            } else {
                setOpenProfile(true);
                setTimeout(() => setProfileVisible(true), 50);
            }
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
            
            // Clear the access token cookie
            sessionStorage.removeItem('access_token');
            // Then logout from Firebase
            await signOut(auth);
            
            // Clear all cookies and local storage
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
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
            if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
            if (notificationsTimeoutRef.current) clearTimeout(notificationsTimeoutRef.current);
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
                {/* Settings button */}
                <button
                    onClick={handleSettingsClick}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray hover:text-gray-150
                    cursor-pointer transition-colors">
                    <img src="https://www.svgrepo.com/show/372653/settings.svg" className="w-2/3 h-2/3" alt="Settings" />
                </button>

                {/* Notifications button */}
                <button
                    onClick={handleNotificationsClick}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray hover:text-gray-150
                    cursor-pointer transition-colors">
                    <img src="https://www.svgrepo.com/show/505296/bell.svg" className="w-2/3 h-2/3 " alt="Notifications" />
                </button>

                {/* Profile button */}
                <button
                    onClick={handleProfileClick}
                    className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                    cursor-pointer transition-colors">
                    <img src="https://www.svgrepo.com/show/532363/user-alt-1.svg" className="w-2/3 h-2/3" alt="profile" />
                </button>
            </div>

            {/* Settings dropdown */}
            {openSettings && (
                <div className={`absolute top-16 right-40 mt-2 w-44 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden
                transition-opacity duration-150 ${settingsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Header section */}
                    <div className="flex items-center justify-between bg-gray-200 text-black px-4 py-2">
                        <h3 className="text-sm font-medium">Configuraciones</h3>
                    </div>

                    {/* Content section */}
                    <div className="py-2">
                        <Link href="/settings" className="text-black text-sm py-2 px-4 block hover:bg-gray-100">
                            Editar configuraciones
                        </Link>
                    </div>
                </div>
            )}

            {/* Notifications dropdown */}
            {openNotifications && (
                <div className={`absolute top-16 right-24 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden
                transition-opacity duration-150 ${notificationsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Header section */}
                    <div className="flex items-center justify-between bg-gray-200 text-black px-4 py-2">
                        <h3 className="text-sm font-medium ">Notifications</h3>
                        <Link href="/settings/notifications" className="text-xs text-black hover:underline">
                            Configurar
                        </Link>
                    </div>
                    {/* Content section */}
                    <div className="py-10 text-center">
                        <p className="text-gray-700">Sin notificaciones.</p>
                    </div>
                </div>
            )}

            {/* Profile dropdown */}
            {openProfile && (
                <div className={`absolute top-16 right-6 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden
                transition-opacity duration-150 ${profileVisible ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Content section */}
                    <div className="py-2">
                        <Link href="/profile" className="text-black text-sm py-2 px-4 block hover:bg-gray-100">
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