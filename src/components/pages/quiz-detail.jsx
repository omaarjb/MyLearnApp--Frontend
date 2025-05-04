"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Edit, Trash2, Plus, Loader2, ArrowLeft, CheckCircle, BookmarkIcon } from "lucide-react"
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

export default function QuizDetail() {
  const router = useRouter()
  const params = useParams()
  const quizId = params?.quizId
  const { user, isLoaded } = useUser()
  const { toast } = useToast()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  // Use useCallback to memoize the fetch function
  const fetchQuiz = useCallback(async () => {
    // Skip if already fetched or missing required data
    if (hasFetched || !quizId || !isLoaded || !user) return

    try {
      setLoading(true)
      console.log(`Fetching quiz from: ${API_BASE_URL}/professeur/${user.id}/quizzes/${quizId}`)

      const response = await fetch(`${API_BASE_URL}/professeur/${user.id}/quizzes/${quizId}`)

      console.log(`API response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw quiz data:", JSON.stringify(data, null, 2))

      // Process the data to match the specific API format
      const processedData = {
        ...data,
        questions:
          data.questions?.map((question) => {
            // Find the correct option index based on the 'correct' property
            const correctOptionIndex = question.options?.findIndex((opt) => opt.correct === true) || 0

            return {
              ...question,
              // Store the correct option index for rendering
              correctOption: correctOptionIndex,
              // Keep the original options array for reference
              originalOptions: [...question.options],
              // We don't need to transform options here as we'll handle them in the render
            }
          }) || [],
      }

      console.log("Processed quiz data:", JSON.stringify(processedData, null, 2))
      setQuiz(processedData)
      setError(null)
    } catch (err) {
      console.error("Error fetching quiz:", err)
      setError("Impossible de charger le quiz. Veuillez réessayer plus tard.")

      toast({
        title: "Erreur",
        description: "Impossible de charger le quiz. Veuillez réessayer plus tard.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setHasFetched(true) // Mark as fetched to prevent further fetches
    }
  }, [quizId, isLoaded, user, hasFetched]) // Include hasFetched in dependencies

  // Separate useEffect for fetching to better control when it runs
  useEffect(() => {
    if (!hasFetched && isLoaded && user && quizId) {
      fetchQuiz()
    }
  }, [fetchQuiz, hasFetched, isLoaded, user, quizId])

  const handleEditQuiz = () => {
    router.push(`/quizzes/${quizId}/edit`)
  }

  const handleAddQuestion = () => {
    router.push(`/quizzes/${quizId}/questions/create`)
  }

  const handleEditQuestion = (questionId) => {
    router.push(`/quizzes/${quizId}/questions/${questionId}/edit`)
  }

  const confirmDeleteQuestion = (question) => {
    setQuestionToDelete(question)
    setDeleteDialogOpen(true)
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete || !user) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/professeur/${user.id}/questions/${questionToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Update the quiz state to remove the deleted question
      setQuiz({
        ...quiz,
        questions: quiz.questions.filter((q) => q.id !== questionToDelete.id),
      })

      setDeleteDialogOpen(false)
      setQuestionToDelete(null)

      toast({
        title: "Succès",
        description: "Question supprimée avec succès",
      })
    } catch (err) {
      console.error("Error deleting question:", err)
      setError("Erreur lors de la suppression de la question.")

      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la question.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSubjectColor = (subject) => {
    const subjectColors = {
      Programmation: "from-emerald-500 to-teal-600",
      Framework: "from-violet-500 to-purple-600",
      Frontend: "from-rose-500 to-pink-600",
      Backend: "from-blue-500 to-cyan-600",
      DevOps: "from-amber-500 to-yellow-600",
      Database: "from-indigo-500 to-blue-600",
      Math: "from-green-500 to-emerald-600",
    }

    return subjectColors[subject] || "from-gray-500 to-slate-600"
  }

  if (!isLoaded || (loading && !quiz)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <h2 className="text-2xl font-semibold mb-2">Veuillez vous connecter</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Vous devez être connecté pour voir ce quiz.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md w-full"
          role="alert"
        >
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/quizzes")}>
          Retour à la liste des quiz
        </Button>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <h2 className="text-2xl font-semibold mb-2">Quiz non trouvé</h2>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/quizzes")}>
          Retour à la liste des quiz
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" className="mb-6 gap-2" onClick={() => router.push("/quizzes")}>
          <ArrowLeft className="h-4 w-4" />
          Retour aux quiz
        </Button>

        <Card className="mb-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 overflow-hidden">
          <CardHeader className={`bg-gradient-to-r ${getSubjectColor(quiz.category || quiz.subject)} text-white`}>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  {quiz.title}
                </CardTitle>

                {/* Topic name display under quiz title */}
                {quiz.topic && (
                  <div className="flex items-center gap-2 mt-2 ml-10 text-white/90">
                    <BookmarkIcon className="h-4 w-4" />
                    <span className="font-medium">{quiz.topic.name}</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" className="text-white hover:bg-white/20" onClick={handleEditQuiz}>
                <Edit className="h-5 w-5 mr-2" />
                Modifier
              </Button>
            </div>
            <p className="text-white/80 text-lg mt-3">{quiz.description}</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm"
              >
                {quiz.category || quiz.subject}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <BookOpen className="h-4 w-4" />
                <span>{quiz.questions?.length || 0} questions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Questions</h2>
          <Button
            onClick={handleAddQuestion}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter une question
          </Button>
        </div>

        {!quiz.questions || quiz.questions.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Aucune question</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Ce quiz ne contient pas encore de questions.</p>
            <Button
              onClick={handleAddQuestion}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Ajouter votre première question
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <Card key={question.id} className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium">Question {index + 1}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {question.points || 1} {(question.points || 1) > 1 ? "points" : "point"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditQuestion(question.id)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => confirmDeleteQuestion(question)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-lg mb-4">{question.text}</p>
                  <div className="space-y-3">
                    {Array.isArray(question.options) &&
                      question.options.map((option, optionIndex) => (
                        <div
                          key={typeof option === "object" ? option.id : optionIndex}
                          className={`p-3 rounded-lg border ${
                            (typeof option === "object" ? option.correct : question.correctOption === optionIndex)
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            {(typeof option === "object" ? option.correct : question.correctOption === optionIndex) && (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            )}
                            <span>{typeof option === "object" ? option.text : option}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette question?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuestion} className="bg-red-500 hover:bg-red-600 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
