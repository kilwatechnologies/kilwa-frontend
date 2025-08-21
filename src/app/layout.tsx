import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kilwa Analytics - Sovereign Risk Intelligence",
  description: "Investment Suitability Index and Market Entry Timing Indicator for African markets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="md:pl-64">
            <main className="p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
