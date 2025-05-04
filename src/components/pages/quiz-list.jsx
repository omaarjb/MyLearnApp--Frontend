"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Edit, Trash2, Loader2, Brain, Code, Database, Server, Cpu, LineChart } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

// API base URL
const API_BASE_URL = "http://localhost:8080/api"

export default function QuizList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState(null)

  // Track if the component is mounted to prevent memory leaks
  const [isMounted, setIsMounted] = useState(false)

  // Add a ref to track last fetch time
  const lastFetchTimeRef = useRef(0)
  // Add a ref for the fetchInProgress flag
  const fetchInProgressRef = useRef(false)

  // Check for refresh trigger in URL params
  const shouldRefresh = searchParams.get("refresh") === "true"

  // Set up focus and blur event listeners to refresh when returning to the page
  useEffect(() => {
    setIsMounted(true)

    // Function to handle window focus (when user returns to tab)
    const handleFocus = () => {
      if (!user || !isMounted) return

      // Ensure we don't refetch more often than every 30 seconds on focus
      const now = Date.now()
      const timeSinceLastFetch = now - lastFetchTimeRef.current

      if (timeSinceLastFetch > 30000 && !fetchInProgressRef.current) {
        fetchQuizzes()
      }
    }

    // Add event listeners
    window.addEventListener("focus", handleFocus)

    // Clean up
    return () => {
      setIsMounted(false)
      window.removeEventListener("focus", handleFocus)
    }
  }, [user]) // Only re-run this effect when user changes

  // Effect for fetching quizzes when user loads or refresh is triggered
  useEffect(() => {
    if (isLoaded && user && isMounted) {
      fetchQuizzes()

      // If there was a refresh parameter in the URL, clear it
      if (shouldRefresh) {
        const newUrl = pathname
        router.replace(newUrl)
      }
    }
  }, [isLoaded, user, shouldRefresh, isMounted]) // Added isMounted to dependencies

  const fetchQuizzes = async () => {
    // If a fetch is already in progress, don't start another one
    if (fetchInProgressRef.current) return

    try {
      setLoading(true)
      fetchInProgressRef.current = true

      if (!user) return

      const clerkId = user.id
      console.log(`Fetching quizzes from: ${API_BASE_URL}/professeur/${clerkId}/quizzes`)

      const response = await fetch(`${API_BASE_URL}/professeur/${clerkId}/quizzes`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      console.log(`API response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Quizzes fetched:", data)
      setQuizzes(data)
      setError(null)

      // Update the last fetch time
      lastFetchTimeRef.current = Date.now()
    } catch (err) {
      console.error("Error fetching quizzes:", err)
      setError("Impossible de charger les quiz. Veuillez réessayer plus tard.")

      toast({
        title: "Erreur",
        description: "Impossible de charger les quiz. Veuillez réessayer plus tard.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      fetchInProgressRef.current = false
    }
  }

  const handleViewQuiz = (quizId) => {
    router.push(`/quizzes/${quizId}`)
  }

  const handleEditQuiz = (quizId) => {
    router.push(`/quizzes/${quizId}/edit`)
  }

  const confirmDeleteQuiz = (quiz) => {
    setQuizToDelete(quiz)
    setDeleteDialogOpen(true)
  }

  // FIXED DELETE FUNCTION
  const handleDeleteQuiz = async () => {
    if (!quizToDelete || !user) return

    try {
      setLoading(true)

      // Construct the URL properly
      const url = `${API_BASE_URL}/professeur/${user.id}/quizzes/${quizToDelete.id}`

      console.log(`Deleting quiz: ${url}`)

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error(`Error response: ${response.status}`, errorData)
        throw new Error(`Error: ${response.status} - ${errorData}`)
      }

      // Update the state without refetching
      setQuizzes((currentQuizzes) => currentQuizzes.filter((quiz) => quiz.id !== quizToDelete.id))

      setDeleteDialogOpen(false)
      setQuizToDelete(null)

      toast({
        title: "Succès",
        description: "Quiz supprimé avec succès",
      })
    } catch (err) {
      console.error("Error deleting quiz:", err)
      setError(`Erreur lors de la suppression du quiz: ${err.message}`)

      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du quiz: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to refresh quizzes (manually triggered)
  const handleRefresh = () => {
    fetchQuizzes()
  }

  const getQuizColor = (quiz) => {
    // Use the color property if available, otherwise fall back to subject-based colors
    if (quiz.color) {
      return quiz.color
    }

    // Fallback to the original subject-based colors
    const subjectColors = {
      Programmation: "from-emerald-500 to-teal-600",
      Framework: "from-violet-500 to-purple-600",
      Frontend: "from-rose-500 to-pink-600",
      Backend: "from-blue-500 to-cyan-600",
      DevOps: "from-amber-500 to-yellow-600",
      Database: "from-indigo-500 to-blue-600",
      Math: "from-green-500 to-emerald-600",
    }

    return subjectColors[quiz.category || quiz.subject] || "from-gray-500 to-slate-600"
  }

  const getQuizIcon = (quiz) => {
    // Map icon names to Lucide icon components
    const iconMap = {
      Brain: Brain,
      Code: Code,
      Database: Database,
      Server: Server,
      Cpu: Cpu,
      LineChart: LineChart,
      // Add more mappings as needed
    }

    // Use the specified icon if available and exists in our map, otherwise default to BookOpen
    const IconComponent = quiz.icon && iconMap[quiz.icon] ? iconMap[quiz.icon] : BookOpen

    return <IconComponent className="h-6 w-6" />
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-2">Veuillez vous connecter</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Vous devez être connecté pour voir vos quiz.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mes Quiz</h1>
          <div className="flex gap-4">
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Rafraîchir
            </Button>
            <Button
              onClick={() => router.push("/create-quiz")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Créer un Quiz
            </Button>
          </div>
        </div>

        {loading && quizzes.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erreur!</strong>
            <span className="block sm:inline"> {error}</span>
            <p className="mt-2 text-sm">
              Vérifiez que votre API backend est en cours d'exécution à l'adresse: {API_BASE_URL}
            </p>
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2">Aucun quiz trouvé</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Vous n'avez pas encore de quiz.</p>
            <Button
              onClick={() => router.push("/create-quiz")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Créer votre premier quiz
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm dark:bg-gray-800/60"
            >
              <CardHeader className={`bg-gradient-to-r ${getQuizColor(quiz)} text-white`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">{getQuizIcon(quiz)}</div>
                    {quiz.title}
                  </CardTitle>
                </div>

                <p className="text-white/80">{quiz.description}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {quiz.category || quiz.subject}
                    </Badge>

                    {quiz.difficulty && (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {quiz.difficulty}
                      </Badge>
                    )}
                  </div>

                  {/* Topic name display */}
                  {quiz.topic && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <span className="font-medium">Sujet:</span> {quiz.topic.name}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="h-4 w-4" />
                    <span>{quiz.questions?.length || 0} questions</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditQuiz(quiz.id)} className="h-9 w-9">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => confirmDeleteQuiz(quiz)}
                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button className={`bg-gradient-to-r ${getQuizColor(quiz)}`} onClick={() => handleViewQuiz(quiz.id)}>
                  Voir le Quiz
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les questions associées à ce quiz seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} className="bg-red-500 hover:bg-red-600 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
