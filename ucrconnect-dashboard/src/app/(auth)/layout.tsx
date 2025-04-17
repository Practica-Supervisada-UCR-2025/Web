'use client';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #0C344E 0%, #249DD8 100%)" }}>
        {children}
      </div>
    );
} 