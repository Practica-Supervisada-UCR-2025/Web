import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UCRConnect",
  description: "UCRConnect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Inline AppDynamics config script */}
        <script
          id="adrum-inline"
          dangerouslySetInnerHTML={{
            __html: `
              window["adrum-start-time"] = new Date().getTime();
              (function(config){
                config.appKey = "AD-AAB-ADZ-BJH";
                config.adrumExtUrlHttp = "http://cdn.appdynamics.com";
                config.adrumExtUrlHttps = "https://cdn.appdynamics.com";
                config.beaconUrlHttp = "http://pdx-col.eum-appdynamics.com";
                config.beaconUrlHttps = "https://pdx-col.eum-appdynamics.com";
                config.useHTTPSAlways = true;
                config.resTiming = {"bufSize":200,"clearResTimingOnBeaconSend":true};
                config.maxUrlLength = 512;
              })(window["adrum-config"] || (window["adrum-config"] = {}));
            `,
          }}
        />

        {/* External AppDynamics JS */}
        <script
          src="https://cdn.appdynamics.com/adrum/adrum-24.4.0.4454.js"
          defer
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
