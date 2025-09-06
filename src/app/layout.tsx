import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="antialiased 
      ">
        {children}
      </body>
    </html>
  )
}