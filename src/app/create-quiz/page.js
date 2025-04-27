"use client"

import CreateQuizForm from "@/components/create-quiz-form"
import Navbar from "@/components/navbar"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CreateQuizPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [isProfessor, setIsProfessor] = useState(false)

  // Check authentication and user role
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in")
      } else {
        // Check if user has the professor role from unsafe metadata
        const userRole = user.unsafeMetadata?.role || ""
        setIsProfessor(userRole === "professeur")
        
        // Redirect non-professor users
        if (userRole !== "professeur") {
          router.push("/unauthorized")
        }
      }
    }
  }, [isLoaded, isSignedIn, router, user])

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Only render CreateQuizForm if user is signed in AND has professor role
  if (isSignedIn && isProfessor) {
    return (
      <>
        <Navbar />
        <CreateQuizForm />
      </>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentification requise</h1>
        <p className="mb-4">Vous devez être connecté en tant que professeur pour créer des quiz.</p>
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