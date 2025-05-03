"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Target, BookOpen, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import AIQuizGenerator from "@/components/ai-quiz-generator"

const CATEGORIES = ["Programmation", "Framework", "Frontend", "Backend", "DevOps", "Database", "Math"]
const DIFFICULTY_LEVELS = ["Débutant", "Intermédiaire", "Avancé"]
const ICONS = ["Brain", "Zap", "Target", "BookOpen"]
const COLOR_SCHEMES = [
  { name: "Vert", value: "from-emerald-500 to-teal-600" },
  { name: "Violet", value: "from-violet-500 to-purple-600" },
  { name: "Rose", value: "from-rose-500 to-pink-600" },
  { name: "Bleu", value: "from-blue-500 to-cyan-600" },
  { name: "Ambre", value: "from-amber-500 to-yellow-600" },
]

const getIconComponent = (iconName) => {
  switch (iconName) {
    case "Brain":
      return <Brain className="h-6 w-6" />
    case "Zap":
      return <Zap className="h-6 w-6" />
    case "Target":
      return <Target className="h-6 w-6" />
    default:
      return <BookOpen className="h-6 w-6" />
  }
}

export default function CreateQuizForm() {
  const { toast } = useToast()
  const { user, isLoaded } = useUser()
  const [topics, setTopics] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const fetchedTopicsRef = useRef(false)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const API_BASE_URL = "http://localhost:8081"

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    icon: "Brain",
    color: "from-emerald-500 to-teal-600",
    timeLimit: 300, // 5 minutes in seconds
    topic: {
      id: "",
    },
    questions: [
      {
        text: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ],
  })

  // Fetch topics when component mounts
  useEffect(() => {
    // Use a ref to ensure we only fetch once
    if (fetchedTopicsRef.current) return

    const fetchTopics = async () => {
      if (isLoadingTopics) return

      setIsLoadingTopics(true)
      console.log("Fetching topics...")

      try {
        const response = await fetch(`${API_BASE_URL}/api/topics`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.status}`)
        }

        const data = await response.json()
        console.log("Topics fetched:", data)
        setTopics(data)

        // Set default topic if available
        if (data.length > 0) {
          setQuizData((prev) => ({
            ...prev,
            topic: {
              id: data[0].id,
            },
          }))
        }

        // Mark as fetched
        fetchedTopicsRef.current = true
      } catch (error) {
        console.error("Error fetching topics:", error)
        toast({
          title: "Error",
          description: "Failed to load topics. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTopics(false)
      }
    }

    fetchTopics()
  }, [])

  const handleQuizDataChange = (field, value) => {
    setQuizData({
      ...quizData,
      [field]: value,
    })
  }

  const handleTopicChange = (topicId) => {
    setQuizData({
      ...quizData,
      topic: {
        id: Number.parseInt(topicId),
      },
    })
  }

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    }
    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[questionIndex].options[optionIndex].text = value
    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })
  }

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions]
    // Set all options to false first
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map((option, idx) => ({
      ...option,
      isCorrect: idx === optionIndex,
    }))

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })
  }

  const addQuestion = () => {
    const newQuestion = {
      text: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    }
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    })
  }

  const removeQuestion = (questionIndex) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = quizData.questions.filter((_, index) => index !== questionIndex)
      setQuizData({
        ...quizData,
        questions: updatedQuestions,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoaded || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a quiz",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (!quizData.title || !quizData.description || !quizData.category || !quizData.difficulty || !quizData.topic.id) {
      toast({
        title: "Missing information",
        description: "Please fill in all the quiz details",
        variant: "destructive",
      })
      return
    }

    // Validate questions
    for (const question of quizData.questions) {
      if (!question.text.trim()) {
        toast({
          title: "Incomplete question",
          description: "Please provide text for all questions",
          variant: "destructive",
        })
        return
      }

      // Check if all options have text
      for (const option of question.options) {
        if (!option.text.trim()) {
          toast({
            title: "Incomplete options",
            description: "Please provide text for all options",
            variant: "destructive",
          })
          return
        }
      }

      // Ensure one option is marked as correct
      if (!question.options.some((option) => option.isCorrect)) {
        toast({
          title: "Missing correct answer",
          description: "Please mark a correct answer for each question",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      // Get the professor ID from the Clerk user
      const professorId = user.id

      // Create the request
      const response = await fetch(`${API_BASE_URL}/api/quizzes/complete/professor/${professorId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const result = await response.json()

      toast({
        title: "Success!",
        description: "Your quiz has been created successfully",
      })

      // Reset form or redirect
      setQuizData({
        title: "",
        description: "",
        category: "",
        difficulty: "",
        icon: "Brain",
        color: "from-emerald-500 to-teal-600",
        timeLimit: 300,
        topic: {
          id: topics.length > 0 ? topics[0].id : "",
        },
        questions: [
          {
            text: "",
            options: [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
          },
        ],
      })
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to manually refresh topics
  const refreshTopics = async () => {
    setIsLoadingTopics(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/topics`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.status}`)
      }

      const data = await response.json()
      setTopics(data)

      toast({
        title: "Topics refreshed",
        description: `${data.length} topics loaded successfully.`,
      })
    } catch (error) {
      console.error("Error refreshing topics:", error)
      toast({
        title: "Error",
        description: "Failed to refresh topics.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTopics(false)
    }
  }

  // Handle AI-generated quiz
  // Function to handle AI-generated quiz
const handleAIQuizGenerated = (generatedQuiz) => {
  // Find the topic ID that matches the generated quiz (or use the first one)
  const topicId = quizData.topic.id || (topics.length > 0 ? topics[0].id : "")

  // Transform the questions to match the expected format
  const transformedQuestions = generatedQuiz.questions.map((question) => {
    return {
      text: question.text,
      options: question.options.map((option) => ({
        text: option.text,
        isCorrect: option.correct, // Convert 'correct' to 'isCorrect'
      })),
    }
  })

  // Update the quiz data with the AI-generated content
  setQuizData({
    ...generatedQuiz,
    topic: {
      id: topicId,
    },
    questions: transformedQuestions, // Use the transformed questions
  })

  toast({
    title: "Quiz généré avec succès",
    description: "Vous pouvez maintenant modifier le quiz avant de le soumettre.",
  })
}


  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Créer un Quiz</h1>
          {isLoaded && user && (
            <p className="text-gray-600 dark:text-gray-400">
              Connecté en tant que: {user.firstName} {user.lastName}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quiz Details Card */}
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
                    onChange={(e) => handleQuizDataChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez brièvement le contenu du quiz"
                    value={quizData.description}
                    onChange={(e) => handleQuizDataChange("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={quizData.category}
                      onValueChange={(value) => handleQuizDataChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulté</Label>
                    <Select
                      value={quizData.difficulty}
                      onValueChange={(value) => handleQuizDataChange("difficulty", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="topic">Sujet</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={refreshTopics}
                      disabled={isLoadingTopics}
                      className="h-8 px-2 text-xs"
                    >
                      {isLoadingTopics ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : "Rafraîchir"}
                    </Button>
                  </div>
                  <Select value={quizData.topic.id.toString()} onValueChange={(value) => handleTopicChange(value)}>
                    <SelectTrigger disabled={isLoadingTopics || topics.length === 0}>
                      {isLoadingTopics ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Chargement...</span>
                        </div>
                      ) : (
                        <SelectValue
                          placeholder={topics.length === 0 ? "Aucun sujet disponible" : "Sélectionner un sujet"}
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id.toString()}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {topics.length === 0 && !isLoadingTopics && (
                    <p className="text-sm text-red-500 mt-1">
                      Aucun sujet disponible. Veuillez en créer un ou rafraîchir la liste.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Temps limite (secondes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="60"
                    max="3600"
                    value={quizData.timeLimit}
                    onChange={(e) => handleQuizDataChange("timeLimit", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icône</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICONS.map((icon) => (
                      <div
                        key={icon}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-lg border cursor-pointer",
                          quizData.icon === icon
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700"
                            : "border-gray-200 dark:border-gray-700",
                        )}
                        onClick={() => handleQuizDataChange("icon", icon)}
                      >
                        {getIconComponent(icon)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_SCHEMES.map((scheme) => (
                      <div
                        key={scheme.value}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-lg cursor-pointer border",
                          quizData.color === scheme.value ? "border-white" : "border-transparent",
                          `bg-gradient-to-r ${scheme.value}`,
                        )}
                        onClick={() => handleQuizDataChange("color", scheme.value)}
                      >
                        <span className="text-white font-medium">{scheme.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Card */}
            <div className="md:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Questions</CardTitle>
                  <Button type="button" onClick={addQuestion} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter une question
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {quizData.questions.map((question, questionIndex) => (
                    <Card
                      key={questionIndex}
                      className="border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                    >
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <h3 className="font-medium">Question {questionIndex + 1}</h3>
                        {quizData.questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                            className="h-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${questionIndex}`}>Texte de la question</Label>
                          <Textarea
                            id={`question-${questionIndex}`}
                            placeholder="Entrez votre question"
                            value={question.text}
                            onChange={(e) => handleQuestionChange(questionIndex, "text", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Options de réponse</Label>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-start gap-3">
                                <RadioGroup
                                  value={option.isCorrect ? optionIndex.toString() : undefined}
                                  onValueChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                                  className="mt-2"
                                >
                                  <RadioGroupItem
                                    value={optionIndex.toString()}
                                    id={`q${questionIndex}-option${optionIndex}`}
                                    className="border-purple-600"
                                  />
                                </RadioGroup>
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`q${questionIndex}-option${optionIndex}`}
                                    className={cn("mb-1 block", option.isCorrect && "text-purple-400")}
                                  >
                                    Option {optionIndex + 1}
                                    {option.isCorrect && <Badge className="ml-2 bg-purple-600">Correcte</Badge>}
                                  </Label>
                                  <Input
                                    placeholder={`Texte de l'option ${optionIndex + 1}`}
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2 px-6"
              onClick={() => setIsAIModalOpen(true)}
            >
              <Zap className="h-4 w-4" />
              Créer Quiz avec AI
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2 px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Créer le Quiz
                </>
              )}
            </Button>
          </div>
        </form>

        {/* AI Quiz Generator Modal */}
        <AIQuizGenerator
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onQuizGenerated={handleAIQuizGenerated}
          userId={user?.id}
        />
      </div>
    </div>
  )
}
