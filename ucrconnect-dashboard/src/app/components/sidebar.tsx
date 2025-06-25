"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Initialize isOpen from localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarState');
        if (savedState !== null) {
            setIsOpen(savedState === 'open');
        }
    }, []);

    // Save state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('sidebarState', isOpen ? 'open' : 'collapsed');
    }, [isOpen]);

    const isActive = (path: string) => {
        return pathname === path;
    };

    const navItems = [
        { name: 'General', path: '/dashboard', icon: 'https://www.svgrepo.com/show/371938/house.svg' },
        { name: 'Usuarios', path: '/users', icon: 'https://www.svgrepo.com/show/535711/user.svg' },
        { name: 'Contenido', path: '/content', icon: 'https://www.svgrepo.com/show/522137/grid.svg' },
        { name: 'Anal\u00EDticas', path: '/analytics', icon: 'https://www.svgrepo.com/show/491241/graph-asc.svg' },
        { name: 'Notificaciones', path: '/notifications', icon: 'https://www.svgrepo.com/show/535206/bell.svg' },
    ];

    // Toggle sidebar function
    const toggleSidebar = () => {
        setIsAnimating(true);
        setIsOpen(!isOpen);
        setTimeout(() => {
            setIsAnimating(false);
        }, 300);
    };

    // Toggle mobile menu function
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Desktop sidebar content
    const desktopSidebarContent = (
        <nav className="flex flex-col h-full">
            <div className="flex-1 py-4">
                {/* Main Title */}
                <div className={`flex justify-between items-center px-6 pb-5 ${!isOpen ? 'hidden' : ''}`}>
                    <Link href="/" className="text-blue-950 text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                        UCR Connect
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0"
                    >
                        <span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </span>
                    </button>
                </div>

                {/* Collapsed state */}
                {!isOpen && (
                    <div className="flex justify-center items-center py-4">
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            </span>
                        </button>
                    </div>
                )}

                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <li key={item.path} className="relative">
                                {active && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                )}
                                <Link
                                    href={item.path}
                                    className={`flex items-center ${isOpen ? 'px-6' : 'px-3 justify-center'} py-3 transition-colors
                                        ${active
                                            ? 'text-blue-500'
                                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <img
                                        src={item.icon}
                                        className={`w-5 h-5 ${isOpen && !isAnimating ? 'mr-3' : ''} ${active ? '' : 'opacity-60'}`}
                                        alt={item.name}
                                    />
                                    {isOpen && !isAnimating && <span className={active ? 'font-bold' : ''}>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );

    // Mobile sidebar content
    const mobileSidebarContent = (
        <nav className="flex flex-col h-full">
            <div className="flex-1 py-4">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <Link href="/dashboard" className="text-blue-950 text-xl" onClick={() => setIsMobileMenuOpen(false)}>
                        UCR Connect
                    </Link>
                </div>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <li key={item.path} className="relative">
                                {active && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                )}
                                <Link
                                    href={item.path}
                                    className={`flex items-center px-6 py-3 transition-colors
                                        ${active
                                            ? 'text-blue-500'
                                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <img
                                        src={item.icon}
                                        className={`w-5 h-5 mr-3 ${active ? '' : 'opacity-60'}`}
                                        alt={item.name}
                                    />
                                    <span className={active ? 'font-bold' : ''}>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:block ${isOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 h-full transition-all duration-300 overflow-hidden`}>
                {desktopSidebarContent}
            </aside>

            {/* Mobile Burger Button */}
            <div className="md:hidden fixed top-4 left-4 z-30">
                {!isMobileMenuOpen && (
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-md bg-white shadow-md text-gray-700 focus:outline-none"
                    >
                        {/* Burger Icon */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                )}
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden fixed top-4 right-4 z-30">
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-md bg-white shadow-md text-gray-700 focus:outline-none"
                    >
                        {/* Close Icon */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-20 flex">
                    {/* Menu */}
                    <div className="w-4/5 bg-white h-full shadow-lg z-30">
                        {mobileSidebarContent}
                    </div>

                    {/* Darkened Background */}
                    <div
                        className="w-1/5 bg-stone-950 opacity-50"
                        onClick={toggleMobileMenu}
                    ></div>
                </div>
            )}
        </>
    );
}