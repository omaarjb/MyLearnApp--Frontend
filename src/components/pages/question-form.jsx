"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = "http://localhost:8080/api"

export default function QuestionForm() {
  const router = useRouter()
  const params = useParams()
  const quizId = params?.quizId
  const questionId = params?.questionId
  const isEditMode = questionId !== "create" && questionId !== undefined
  const { user, isLoaded } = useUser()
  const { toast } = useToast()

  const [quiz, setQuiz] = useState(null)
  const [questionData, setQuestionData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctOption: 0,
    points: 1,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId || !isLoaded || !user) return

      try {
        setLoading(true)
        console.log(`Fetching quiz from: ${API_BASE_URL}/professeur/${user.id}/quizzes/${quizId}`)

        // Fetch the quiz data
        const response = await fetch(`${API_BASE_URL}/professeur/${user.id}/quizzes/${quizId}`)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const quizData = await response.json()
        console.log("Quiz data:", quizData)
        setQuiz(quizData)

        // If editing, find the question in the quiz
        if (isEditMode && quizData.questions) {
          console.log("Looking for question with ID:", questionId)
          console.log("Available questions:", quizData.questions)

          const question = quizData.questions.find((q) => String(q.id) === String(questionId))
          console.log("Found question:", question)

          if (question) {
            // Process options based on their format
            let processedOptions = []
            let correctOptionIndex = 0

            if (Array.isArray(question.options)) {
              if (question.options.length > 0 && typeof question.options[0] === "object") {
                // If options are objects with {id, text, correct} format
                processedOptions = question.options.map((opt) => opt.text || "")
                correctOptionIndex = question.options.findIndex((opt) => opt.correct === true)
                // If no correct option found, default to first option
                if (correctOptionIndex === -1) correctOptionIndex = 0
              } else {
                // If options are already strings
                processedOptions = [...question.options]
                correctOptionIndex = typeof question.correctOption === "number" ? question.correctOption : 0
              }
            }

            // Ensure we have at least 2 options
            while (processedOptions.length < 2) {
              processedOptions.push("")
            }

            setQuestionData({
              text: question.text || "",
              options: processedOptions,
              correctOption: correctOptionIndex,
              points: question.points || 1,
            })

            console.log("Set question data:", {
              text: question.text || "",
              options: processedOptions,
              correctOption: correctOptionIndex,
              points: question.points || 1,
            })
          } else {
            console.error("Question not found in quiz data")
            setError("Question non trouvée dans le quiz.")
          }
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Impossible de charger les données. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [quizId, questionId, isEditMode, isLoaded, user])

  const handleTextChange = (value) => {
    setQuestionData({
      ...questionData,
      text: value,
    })
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options]
    newOptions[index] = value
    setQuestionData({
      ...questionData,
      options: newOptions,
    })
  }

  const handleCorrectOptionChange = (value) => {
    // Ensure value is a number and within valid range
    const numValue = Number(value)
    
    if (!isNaN(numValue) && numValue >= 0 && numValue < questionData.options.length) {
      console.log("Setting correctOption to:", numValue)
      setQuestionData({
        ...questionData,
        correctOption: numValue,
      })
    }
  }

  const handlePointsChange = (value) => {
    // Ensure value is a positive number
    const numValue = Number.parseInt(value, 10)
    if (!isNaN(numValue) && numValue > 0) {
      setQuestionData({
        ...questionData,
        points: numValue,
      })
    }
  }

  const addOption = () => {
    if (questionData.options.length < 6) {
      setQuestionData({
        ...questionData,
        options: [...questionData.options, ""],
      })
    }
  }

  const removeOption = (index) => {
    if (questionData.options.length > 2) {
      const newOptions = questionData.options.filter((_, i) => i !== index)

      // Adjust correctOption if needed
      let newCorrectOption = questionData.correctOption
      if (questionData.correctOption === index) {
        newCorrectOption = 0
      } else if (questionData.correctOption > index) {
        newCorrectOption = questionData.correctOption - 1
      }

      setQuestionData({
        ...questionData,
        options: newOptions,
        correctOption: newCorrectOption,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoaded || !user) {
      setError("Vous devez être connecté pour effectuer cette action.")
      return
    }

    try {
      setSaving(true)

      // Format the data for the API
      const apiData = {
        text: questionData.text,
        points: questionData.points,
        options: questionData.options.map((text, index) => {
          // Explicitly convert correctOption to a number to ensure type consistency
          const correctOptionIndex = Number(questionData.correctOption)
          const isCorrect = index === correctOptionIndex
          
          return {
            text,
            correct: isCorrect,
          }
        }),
      }

      console.log("Submitting data with correct option index:", questionData.correctOption)
      console.log("Formatted API data:", JSON.stringify(apiData, null, 2))

      if (isEditMode) {
        const response = await fetch(`${API_BASE_URL}/professeur/${user.id}/questions/${questionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`Error: ${response.status}`)
        }

        toast({
          title: "Succès",
          description: "Question modifiée avec succès",
        })
      } else {
        const response = await fetch(`${API_BASE_URL}/professeur/${user.id}/quizzes/${quizId}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`Error: ${response.status}`)
        }

        toast({
          title: "Succès",
          description: "Question ajoutée avec succès",
        })
      }

      router.push(`/quizzes/${quizId}`)
    } catch (err) {
      console.error("Error saving question:", err)
      setError("Erreur lors de l'enregistrement de la question.")

      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement de la question.",
        variant: "destructive",
      })
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

  if (loading && !quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
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
        <Button variant="outline" className="mb-6 gap-2" onClick={() => router.push(`/quizzes/${quizId}`)}>
          <ArrowLeft className="h-4 w-4" />
          Retour au quiz
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{isEditMode ? "Modifier la Question" : "Ajouter une Question"}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Quiz: {quiz.title}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Erreur!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 mb-6">
            <CardHeader>
              <CardTitle>Détails de la Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Texte de la question</Label>
                <Input
                  id="text"
                  placeholder="Entrez votre question"
                  value={questionData.text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="10"
                  value={questionData.points}
                  onChange={(e) => handlePointsChange(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Options de réponse</CardTitle>
              <Button
                type="button"
                onClick={addOption}
                variant="outline"
                className="gap-2"
                disabled={questionData.options.length >= 6}
              >
                <Plus className="h-4 w-4" />
                Ajouter une option
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={String(questionData.correctOption)}
                onValueChange={(value) => handleCorrectOptionChange(value)}
                className="space-y-4"
              >
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <RadioGroupItem 
                      value={String(index)} 
                      id={`option-${index}`} 
                      className="mt-2 border-purple-600" 
                      checked={Number(questionData.correctOption) === index}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Label
                          htmlFor={`option-${index}`}
                          className={cn("block", Number(questionData.correctOption) === index && "text-purple-600 font-medium")}
                        >
                          Option {index + 1}
                          {Number(questionData.correctOption) === index && (
                            <Badge className="ml-2 bg-purple-600">Correcte</Badge>
                          )}
                        </Label>
                        {questionData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder={`Texte de l'option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </RadioGroup>
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
                  {isEditMode ? "Enregistrer les modifications" : "Ajouter la question"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}