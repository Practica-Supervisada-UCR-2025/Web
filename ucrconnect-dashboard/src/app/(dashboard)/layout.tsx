'use client';

import Sidebar from "@/app/components/sidebar";
import Header from "@/app/components/header";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      </div>
    );
} 