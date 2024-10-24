// src/app/layout.tsx (Server Component - No 'use client')
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import localFont from 'next/font/local';
import './globals.css';
import type { Metadata } from 'next'; // Import Metadata type
import ClientLayout from './clientLayout'; // Import client-side layout

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'MiniReddit',
  description: 'A Reddit Clone',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Navbar />
          <ClientLayout>{children}</ClientLayout> {/* Use client layout here */}
        </body>
      </html>
    </ClerkProvider>
  );
}
