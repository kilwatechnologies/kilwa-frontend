import type { Metadata } from 'next'
import './globals.css'
import { GeistSans } from "geist/font/sans";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kilwa - Investment Analytics Platform',
  description: 'Sovereign risk analytics and investment insights for African markets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en"  >
      <body className={`${GeistSans.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}