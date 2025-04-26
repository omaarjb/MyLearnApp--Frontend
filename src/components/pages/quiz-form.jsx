"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"

// With these constants and functions directly in the component
const API_BASE_URL = "http://localhost:8081/api"

export default function QuizForm() {
  const router = useRouter()
  const params = useParams()
  const quizId = params?.quizId
  const { user, isLoaded } = useUser()

  const [quizData, setQuizData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId || !isLoaded || !user) return

      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/professeur/${user.id}/quizzes/${quizId}`)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        setQuizData(data)
        setError(null)
      } catch (err) {
        setError("Impossible de charger le quiz. Veuillez réessayer plus tard.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, isLoaded, user])

  const handleInputChange = (field, value) => {
    setQuizData({
      ...quizData,
      [field]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoaded || !user) {
      setError("Vous devez être connecté pour effectuer cette action.")
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`${API_BASE_URL}/professeur/${user.id}/quizzes/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      router.push("/quizzes")
    } catch (err) {
      setError("Erreur lors de la mise à jour du quiz.")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
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
        <p className="text-gray-600 dark:text-gray-400 mb-6">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
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

  if (!quizData) {
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Modifier le Quiz</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/60">
            <CardHeader>
              <CardTitle>Détails du Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Entrez le titre du quiz"
                  value={quizData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez brièvement le contenu du quiz"
                  value={quizData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter the subject of the quiz"
                  value={quizData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2 px-6"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
