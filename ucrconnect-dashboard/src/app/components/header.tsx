'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    // Panel states
    const [openSettings, setOpenSettings] = useState(false);
    const [openNotifications, setNotifications] = useState(false);

    // Animation states
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [notificationsVisible, setNotificationsVisible] = useState(false);

    // Get current path to determine section title
    const pathname = usePathname();

    // Map paths to section titles
    const getSectionTitle = () => {
        const pathTitles: Record<string, string> = {
            '/': 'Vista General',
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

    // Function to handle opening settings and closing notifications
    const handleSettingsClick = () => {
        // If settings is already open, start closing animation
        if (openSettings) {
            setSettingsVisible(false);
            settingsTimeoutRef.current = setTimeout(() => {
                setOpenSettings(false);
            }, 150);
        } else {
            // If notifications is open, close it
            if (openNotifications) {
                setNotificationsVisible(false);
                notificationsTimeoutRef.current = setTimeout(() => {
                    setNotifications(false);
                    // Then open settings
                    setOpenSettings(true);
                    setTimeout(() => setSettingsVisible(true), 50);
                }, 150);
            } else {
                // Just open settings
                setOpenSettings(true);
                setTimeout(() => setSettingsVisible(true), 50);
            }
        }
    };

    // Function to handle opening notifications and closing settings
    const handleNotificationsClick = () => {
        // If notifications is already open, start closing animation
        if (openNotifications) {
            setNotificationsVisible(false);
            notificationsTimeoutRef.current = setTimeout(() => {
                setNotifications(false);
            }, 150);
        } else {
            // If settings is open, close it
            if (openSettings) {
                setSettingsVisible(false);
                settingsTimeoutRef.current = setTimeout(() => {
                    setOpenSettings(false);
                    // Then open notifications
                    setNotifications(true);
                    setTimeout(() => setNotificationsVisible(true), 50);
                }, 150);
            } else {
                // Just open notifications
                setNotifications(true);
                setTimeout(() => setNotificationsVisible(true), 50);
            }
        }
    };

    // Clean up timeouts when component unmounts
    useEffect(() => {
        return () => {
            if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
            if (notificationsTimeoutRef.current) clearTimeout(notificationsTimeoutRef.current);
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
                <Link href="/profile">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                    cursor-pointer transition-colors">
                        <img src="https://www.svgrepo.com/show/532363/user-alt-1.svg" className="w-2/3 h-2/3" alt="profile" />
                    </div>
                </Link>
            </div>

            {/* Settings dropdown */}
            {openSettings && (
                <div className={`absolute top-16 right-16 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden
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
                <div className={`absolute top-16 right-16 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden
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
        </header>
    );
}