"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Target, BookOpen, Plus, Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    icon: "Brain",
    color: "from-emerald-500 to-teal-600",
    scorePerQuestion: 1,
    questions: [
      {
        id: 1,
        text: "",
        options: [
          { id: 1, text: "" },
          { id: 2, text: "" },
          { id: 3, text: "" },
          { id: 4, text: "" },
        ],
        correctOptionId: 1,
      },
    ],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuizDataChange = (field, value) => {
    setQuizData({
      ...quizData,
      [field]: value,
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

  const handleCorrectOptionChange = (questionIndex, optionId) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[questionIndex].correctOptionId = optionId
    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })
  }

  const addQuestion = () => {
    const newQuestion = {
      id: quizData.questions.length + 1,
      text: "",
      options: [
        { id: 1, text: "" },
        { id: 2, text: "" },
        { id: 3, text: "" },
        { id: 4, text: "" },
      ],
      correctOptionId: 1,
    }
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    })
  }

  const removeQuestion = (questionIndex) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = quizData.questions.filter((_, index) => index !== questionIndex)
      const reindexedQuestions = updatedQuestions.map((q, index) => ({
        ...q,
        id: index + 1,
      }))
      setQuizData({
        ...quizData,
        questions: reindexedQuestions,
      })
    }
  }

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      alert("Le titre du quiz est requis")
      return false
    }

    if (!quizData.category) {
      alert("Veuillez sélectionner une catégorie")
      return false
    }

    if (!quizData.difficulty) {
      alert("Veuillez sélectionner un niveau de difficulté")
      return false
    }

    for (const question of quizData.questions) {
      if (!question.text.trim()) {
        alert(`Le texte de la question ${question.id} est requis`)
        return false
      }

      for (const option of question.options) {
        if (!option.text.trim()) {
          alert(`L'option ${option.id} de la question ${question.id} est vide`)
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateQuiz()) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Format data to match your Spring Boot Quiz model
      const requestData = {
        title: quizData.title.trim(),
        description: quizData.description.trim(),
        category: quizData.category,
        difficulty: quizData.difficulty,
        scorePerQuestion: quizData.scorePerQuestion,
        questions: quizData.questions.map(question => ({
          questionText: question.text.trim(),  // Changed from 'text' to 'questionText'
          options: question.options.map(option => ({
            optionText: option.text.trim()    // Changed to object with 'optionText'
          })),
          correctOption: question.correctOptionId - 1  // Changed from 'correctOptionIndex'
        }))
      };
  
      console.log("Submitting quiz data:", JSON.stringify(requestData, null, 2));
  
      const response = await fetch('http://localhost:8080/api/quizzes/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error details:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      alert(`Quiz created successfully! ID: ${data.id}`);
  
      // Reset form
      setQuizData({
        title: "",
        description: "",
        category: "",
        difficulty: "",
        icon: "Brain",
        color: "from-emerald-500 to-teal-600",
        scorePerQuestion: 1,
        questions: [{
          id: 1,
          text: "",
          options: [
            { id: 1, text: "" },
            { id: 2, text: "" },
            { id: 3, text: "" },
            { id: 4, text: "" },
          ],
          correctOptionId: 1,
        }],
      });
  
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error creating quiz. Please check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Créer un Quiz</h1>
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
                    required
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
                      required
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
                      required
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
                  <Label htmlFor="scorePerQuestion">Points par question</Label>
                  <Input
                    id="scorePerQuestion"
                    type="number"
                    min="1"
                    max="10"
                    value={quizData.scorePerQuestion}
                    onChange={(e) => handleQuizDataChange("scorePerQuestion", Number.parseInt(e.target.value))}
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
                      key={question.id}
                      className="border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                    >
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <h3 className="font-medium">Question {question.id}</h3>
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
                          <Label htmlFor={`question-${question.id}`}>Texte de la question</Label>
                          <Textarea
                            id={`question-${question.id}`}
                            placeholder="Entrez votre question"
                            value={question.text}
                            onChange={(e) => handleQuestionChange(questionIndex, "text", e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Options de réponse</Label>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div key={option.id} className="flex items-start gap-3">
                                <RadioGroup
                                  value={String(question.correctOptionId)}
                                  onValueChange={(value) =>
                                    handleCorrectOptionChange(questionIndex, Number.parseInt(value))
                                  }
                                  className="mt-2"
                                >
                                  <RadioGroupItem
                                    value={String(option.id)}
                                    id={`q${question.id}-option${option.id}`}
                                    className="border-purple-600"
                                  />
                                </RadioGroup>
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`q${question.id}-option${option.id}`}
                                    className={cn(
                                      "mb-1 block",
                                      question.correctOptionId === option.id && "text-purple-400",
                                    )}
                                  >
                                    Option {option.id}
                                    {question.correctOptionId === option.id && (
                                      <Badge className="ml-2 bg-purple-600">Correcte</Badge>
                                    )}
                                  </Label>
                                  <Input
                                    placeholder={`Texte de l'option ${option.id}`}
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                    required
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
              onClick={() => alert("Fonctionnalité d'IA en cours de développement")}
            >
              <Zap className="h-4 w-4" />
              Créer Quiz avec AI
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2 px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  En cours...
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
      </div>
    </div>
  )
}