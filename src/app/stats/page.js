"use client"

import StatsDisplay from "@/components/stats-display"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function StatsPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Only render StatsDisplay if user is signed in
  if (isSignedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <StatsDisplay user={user} />
        </main>
        <Footer />
      </div>
    )
  }

  // This is a fallback, but the useEffect should redirect before this renders
  return (
    <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentification requise</h1>
        <p className="mb-4">Vous devez être connecté pour accéder aux statistiques.</p>
        <button
          onClick={() => router.push("/sign-in")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md"
        >
          Se connecter
        </button>
      </div>
    </div>
  )
}
