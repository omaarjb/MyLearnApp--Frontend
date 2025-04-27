"use client"

import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Accès non autorisé</h1>
        <p className="mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page. 
          Seuls les utilisateurs avec le rôle étudiant peuvent accéder aux quiz.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Retour à l'accueil
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  )
}