import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { MobileNav } from "@/components/layout/MobileNav";
<<<<<<< HEAD
=======
import { Analytics } from "@vercel/analytics/next";
>>>>>>> f593e93 (Add Vercel Analytics1)

export const metadata: Metadata = {
  title: "CGS Entertainments – India's Premier Competition Platform",
  description: "Show Your Talent. Shine On Stage. Be A Star!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <MobileNav />
        </AuthProvider>
<<<<<<< HEAD
=======
        <Analytics />
>>>>>>> f593e93 (Add Vercel Analytics1)
      </body>
    </html>
  );
}
