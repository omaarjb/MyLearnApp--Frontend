import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  console.log("Dashboard page reached")
  
  // Get the current user
  const user = await currentUser()

  if (!user) {
    console.log("No user found, redirecting to sign-in")
    redirect("/sign-in")
  }

  console.log("User found:", user.id)
  console.log("User metadata:", user.unsafeMetadata)
  
  // Get the role from user unsafeMetadata
  const role = user.unsafeMetadata?.role
  
  console.log("User role:", role)

  // Redirect based on role
  if (role === "student") {
    console.log("Redirecting to /quiz")
    redirect("/quiz")
  } else if (role === "professeur") {
    console.log("Redirecting to /create-quiz")
    redirect("/create-quiz")
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>This is a fallback page if no role is set.</p>
      <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
        {JSON.stringify({ id: user.id, metadata: user.unsafeMetadata }, null, 2)}
      </pre>
    </div>
  )
}
