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

    // SVG Icons as React components
    const icons = {
        house: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
        ),
        user: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        ),
        grid: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
            </svg>
        ),
        graph: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
            </svg>
        ),
        bell: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
        )
    };

    const navItems = [
        { name: 'General', path: '/dashboard', icon: icons.house },
        { name: 'Usuarios', path: '/users', icon: icons.user },
        { name: 'Moderaci\u00F3n', path: '/content', icon: icons.grid },
        { name: 'Anal\u00EDticas', path: '/analytics', icon: icons.graph },
        { name: 'Notificar', path: '/notifications', icon: icons.bell },
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
                                    <div className={`${isOpen && !isAnimating ? 'mr-3' : ''}`}>
                                        {item.icon}
                                    </div>
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
                                    <div className="mr-3">
                                        {item.icon}
                                    </div>
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