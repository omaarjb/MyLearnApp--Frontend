import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              card: "bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl",
              headerTitle:
                "text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600",
              headerSubtitle: "text-center",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
            },
          }}
          redirectUrl="/quiz"
          routing="path"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}

