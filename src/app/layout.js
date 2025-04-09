// app/layout.js
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from "@/components/navbar"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MyLearn",
  description: "Application de quiz interactifs avec correction automatique",
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
         
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}