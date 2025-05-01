"use client"

import QuizApp from "@/components/quiz-app"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function QuizPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [authState, setAuthState] = useState("loading")

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setAuthState("unauthenticated")
      return
    }

    const role = user?.unsafeMetadata?.role || ""
    if (role !== "student") {
      setAuthState("unauthorized")
      return
    }

    setAuthState("authenticated")
  }, [isLoaded, isSignedIn, user])

  if (authState === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (authState === "authenticated") {
    return <QuizApp />
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {authState === "unauthenticated" 
            ? "Authentification requise" 
            : "Accès non autorisé"}
        </h1>
        <p className="mb-6">
          {authState === "unauthenticated"
            ? "Vous devez être connecté pour accéder aux quiz."
            : "Seuls les étudiants peuvent accéder à cette page."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/sign-in")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            {authState === "unauthenticated" ? "Se connecter" : "Changer de compte"}
          </button>
          {authState === "unauthorized" && (
            <button
              onClick={() => router.push("/")}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md transition-colors"
            >
              Retour à l'accueil
            </button>
          )}
        </div>
      </div>
    </div>
  )
}