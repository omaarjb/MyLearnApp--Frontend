// In your dashboard.js or similar page
"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Only proceed when Clerk has fully loaded user data
    if (isLoaded && isSignedIn && user && !isRedirecting) {
      console.log("Dashboard page reached")
      console.log("User found:", user.id)
      
      // Add a small delay to ensure metadata is fully loaded
      setTimeout(() => {
        const userRole = user.unsafeMetadata?.role || ""
        console.log("User metadata:", user.unsafeMetadata)
        console.log("User role:", userRole)

        setIsRedirecting(true)
        
        if (userRole === "student") {
          console.log("Redirecting to /accueil")
          router.push("/accueil")
        } else if (userRole === "professeur") {
          console.log("Redirecting to /accueil")
          router.push("/accueil")
        } else {
          console.log("Unknown role, staying on dashboard")
        }
      }, 500) // Small delay to ensure metadata is available
    }
  }, [isLoaded, isSignedIn, user, router, isRedirecting])

  // Show loading state while determining where to redirect
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )
}