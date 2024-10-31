import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SupabaseProvider from "@/components/providers/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Habit Alchemist",
  description: "Transform your habits with team accountability",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}