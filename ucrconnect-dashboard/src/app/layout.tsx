import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

/*
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});


const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
*/

export const metadata: Metadata = {
    title: "UCR Connect",
    description: "UCR Connect",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} antialiased`}>
                <Providers>{children}</Providers>
                <Toaster position="top-center" />
            </body>
        </html>
    );
}
