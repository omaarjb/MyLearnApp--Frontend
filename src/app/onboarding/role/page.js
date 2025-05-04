"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RoleSelectionPage() {
  const { isLoaded, user } = useUser()  // Removed updateUser from destructuring
  const [role, setRole] = useState("student")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.role) {
      setRole(user.unsafeMetadata.role)
    }
  }, [isLoaded, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!user) {
      setError("User not loaded. Please refresh the page.")
      setIsSubmitting(false)
      return
    }

    try {
      // 1. First update backend
      const response = await fetch("http://localhost:8080/api/user/update-role", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          role: role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to save role to backend")
      }

      // 2. Then update Clerk metadata using user.update()
      try {
        await user.update({
          unsafeMetadata: {
            ...(user.unsafeMetadata || {}), // Preserve existing metadata
            role: role,
          }
        })
        
        // Redirect only after both updates succeed
        router.push("/quiz")
      } catch (updateError) {
        console.error("Clerk metadata update failed:", updateError)
        throw new Error(`Failed to update Clerk profile: ${updateError.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error in role update process:", error)
      setError(error.message || "Failed to save role. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return <div className="loading-indicator">Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl p-8 rounded-lg">
        <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
          Select Your Role
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What best describes your role?
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
              required
            >
              <option value="student">Student</option>
              <option value="professeur">Professeur</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-2 px-4 text-white disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}