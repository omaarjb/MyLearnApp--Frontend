"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BookOpen,
  BarChart3,
  Brain,
  Zap,
  Target,
  User,
  Search,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-windows-size"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export default function QuizApp() {
  const [activeTab, setActiveTab] = useState("explorer")
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    category: "",
    professor: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentAttemptId, setCurrentAttemptId] = useState(null)
  const { userId } = useAuth()
  const { toast } = useToast()
  const [showTimeExpiredDialog, setShowTimeExpiredDialog] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)
  const timeCheckIntervalRef = useRef(null)
  const [timeLimit, setTimeLimit] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const uniqueDifficulties = [...new Set(quizzes.map((quiz) => quiz.difficulty))]
  const uniqueCategories = [...new Set(quizzes.map((quiz) => quiz.category))]
  const uniqueProfessors = [
    ...new Set(
      quizzes
        .map((quiz) => (quiz.professor ? `${quiz.professor.firstName} ${quiz.professor.lastName}` : null))
        .filter(Boolean),
    ),
  ]

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:8080/api/quizzes")

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setQuizzes(data)
        setError(null)
      } catch (err) {
        setError("Impossible de charger les quiz. Veuillez réessayer plus tard.")
        console.error("Error fetching quizzes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  // Timer for quiz duration
  useEffect(() => {
    let interval = null
    if (timerActive && !timeExpired) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1

          // Update time remaining if we have a time limit
          if (timeLimit > 0) {
            const remaining = timeLimit - newTimer
            setTimeRemaining(remaining)

            // If time is up, trigger the time expired flow
            if (remaining <= 0 && !timeExpired) {
              handleTimeExpired()
            }
          }

          return newTimer
        })
      }, 1000)
    } else if (!timerActive && timer !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLimit, timeExpired])

  // Periodic check for time limit on the server
  useEffect(() => {
    // Set up interval to check time limit on server
    if (currentAttemptId && timerActive && !timeExpired) {
      // Clear any existing interval
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current)
      }

      // Set new interval to check every 10 seconds
      timeCheckIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/quiz-attempts/${currentAttemptId}/check-time`)

          if (!response.ok) {
            throw new Error("Failed to check time limit")
          }

          const data = await response.json()

          if (data.timeExceeded && !timeExpired) {
            handleTimeExpired()
          }
        } catch (err) {
          console.error("Error checking time limit:", err)
        }
      }, 10000) // Check every 10 seconds
    }

    // Clean up interval on unmount or when quiz is completed
    return () => {
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current)
        timeCheckIntervalRef.current = null
      }
    }
  }, [currentAttemptId, timerActive, timeExpired])

  // Reset state when switching to explorer tab
  useEffect(() => {
    if (activeTab === "explorer" && !timerActive) {
      setSelectedQuiz(null)
      setQuizCompleted(false)
    }
  }, [activeTab, timerActive])

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current)
      }
    }
  }, [])

  const startQuiz = async (quiz) => {
    try {
      setLoading(true)

      // Start a new quiz attempt
      const response = await fetch(
        `http://localhost:8080/api/quiz-attempts/start?clerkId=${userId}&quizId=${quiz.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start quiz attempt")
      }

      const data = await response.json()
      setCurrentAttemptId(data.attemptId)

      // Set up the quiz state
      setSelectedQuiz(quiz)
      setCurrentQuestion(0)
      setSelectedOptions({})
      setQuizCompleted(false)
      setScore(0)
      setTimer(0)
      setTimerActive(true)
      setTimeExpired(false)

      // Set time limit if the quiz has one
      if (quiz.timeLimit) {
        setTimeLimit(quiz.timeLimit)
        setTimeRemaining(quiz.timeLimit)
      } else {
        setTimeLimit(0)
        setTimeRemaining(0)
      }

      setActiveTab("quiz")
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to start quiz",
        variant: "destructive",
      })
      console.error("Error starting quiz:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: optionId,
    })
  }

  const handleNextQuestion = async () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      await submitQuiz()
    }
  }

  const submitQuiz = async () => {
    // Submit the quiz attempt
    try {
      setLoading(true)

      // Convert selectedOptions to the format expected by the API
      // The API expects a map of questionId -> optionId
      const responses = Object.entries(selectedOptions).reduce((acc, [questionId, optionId]) => {
        acc[questionId] = optionId
        return acc
      }, {})

      const response = await fetch(`http://localhost:8080/api/quiz-attempts/${currentAttemptId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responses),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit quiz attempt")
      }

      const result = await response.json()

      setScore(result.correctAnswers)
      setQuizCompleted(true)
      setTimerActive(false)
      setActiveTab("resultats")

      // Show confetti if score is good
      if (result.correctAnswers >= selectedQuiz.questions.length * 0.7) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit quiz",
        variant: "destructive",
      })
      console.error("Error submitting quiz:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeExpired = async () => {
    // Stop the timer
    setTimerActive(false)
    setTimeExpired(true)

    try {
      // Auto-submit the quiz with the server
      const response = await fetch(`http://localhost:8080/api/quiz-attempts/${currentAttemptId}/auto-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to auto-submit quiz")
      }

      // Show the time expired dialog
      setShowTimeExpiredDialog(true)

      // Set score to 0
      setScore(0)
      setQuizCompleted(true)
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to auto-submit quiz",
        variant: "destructive",
      })
      console.error("Error auto-submitting quiz:", err)
    }
  }

  const handleTimeExpiredDialogClose = () => {
    setShowTimeExpiredDialog(false)
    setActiveTab("resultats")
  }

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const resetQuiz = () => {
    setActiveTab("explorer")
    setSelectedQuiz(null)
    setQuizCompleted(false)
    setCurrentAttemptId(null)
    setTimeExpired(false)

    // Clear any time check interval
    if (timeCheckIntervalRef.current) {
      clearInterval(timeCheckIntervalRef.current)
      timeCheckIntervalRef.current = null
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Débutant":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      case "Intermédiaire":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "Avancé":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value === "all" ? "" : value,
    })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      difficulty: "",
      category: "",
      professor: "",
    })
  }

  const filteredQuizzes = quizzes.filter((quiz) => {
    // Search filter
    if (
      filters.search &&
      !quiz.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !quiz.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Difficulty filter
    if (filters.difficulty && quiz.difficulty !== filters.difficulty) {
      return false
    }

    // Category filter
    if (filters.category && quiz.category !== filters.category) {
      return false
    }

    // Professor filter
    if (
      filters.professor &&
      (!quiz.professor || `${quiz.professor.firstName} ${quiz.professor.lastName}` !== filters.professor)
    ) {
      return false
    }

    return true
  })

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      <Navbar />

      {/* Time Expired Dialog */}
      <AlertDialog open={showTimeExpiredDialog} onOpenChange={setShowTimeExpiredDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Temps écoulé !
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Le temps imparti pour ce quiz est écoulé. Votre tentative a été automatiquement soumise avec un score de
              0.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleTimeExpiredDialogClose}>Voir les résultats</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-white/20 backdrop-blur-sm dark:bg-gray-800/40">
            <TabsTrigger
              value="explorer"
              disabled={timerActive && !quizCompleted}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              disabled={!selectedQuiz}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Clock className="mr-2 h-4 w-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger
              value="resultats"
              disabled={!quizCompleted || !selectedQuiz}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Résultats
            </TabsTrigger>
          </TabsList>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erreur!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <TabsContent value="explorer" className="space-y-6">
            {/* Explorer content remains the same */}
            <div className="w-full mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un quiz..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10 bg-white/80 dark:bg-gray-800/60"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/60"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {(filters.difficulty || filters.category || filters.professor) && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      {Object.values(filters).filter(Boolean).length - (filters.search ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/90 dark:bg-gray-800/80 rounded-lg p-4 mb-6 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Filtrer les quiz</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                      <X className="h-4 w-4 mr-1" />
                      Effacer les filtres
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulté</label>
                      <Select
                        value={filters.difficulty}
                        onValueChange={(value) => handleFilterChange("difficulty", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les difficultés" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les difficultés</SelectItem>
                          {uniqueDifficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Catégorie</label>
                      <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les catégories</SelectItem>
                          {uniqueCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Professeur</label>
                      <Select
                        value={filters.professor}
                        onValueChange={(value) => handleFilterChange("professor", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les professeurs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les professeurs</SelectItem>
                          {uniqueProfessors.map((professor) => (
                            <SelectItem key={professor} value={professor}>
                              {professor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {filteredQuizzes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white/80 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm"
                >
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Aucun quiz trouvé</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Aucun quiz ne correspond à vos critères de recherche.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm dark:bg-gray-800/60">
                        <CardHeader className={`bg-gradient-to-r ${quiz.color} text-white`}>
                          <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                              <div className="p-2 bg-white/20 rounded-lg">{getIconComponent(quiz.icon)}</div>
                              {quiz.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-white/80">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="flex justify-between mb-4">
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              {quiz.category}
                            </Badge>
                            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                              {quiz.difficulty}
                            </Badge>
                          </div>

                          {/* Professor information */}
                          {quiz.professor && (
                            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                              <User className="h-4 w-4" />
                              <span>
                                Professeur : {quiz.professor.firstName} {quiz.professor.lastName}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <BookOpen className="h-4 w-4" />
                              <span>{quiz.questions.length} questions</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>
                                {quiz.timeLimit
                                  ? `${Math.floor(quiz.timeLimit / 60)}:${(quiz.timeLimit % 60).toString().padStart(2, "0")}`
                                  : `~${quiz.questions.length * 30} sec`}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="">
                          <Button
                            className={`w-full bg-gradient-to-r ${quiz.color} hover:shadow-lg`}
                            onClick={() => startQuiz(quiz)}
                          >
                            Commencer le Quiz
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            {selectedQuiz && !quizCompleted && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="w-full max-w-3xl mx-auto bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 overflow-hidden">
                    <CardHeader className={`bg-gradient-to-r ${selectedQuiz.color} text-white`}>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-2 bg-white/20 rounded-lg">{getIconComponent(selectedQuiz.icon)}</div>
                          {selectedQuiz.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {timeLimit > 0 && (
                            <div
                              className={`flex items-center px-3 py-1 rounded-full ${
                                timeRemaining < 60
                                  ? "bg-red-500/70"
                                  : timeRemaining < 180
                                    ? "bg-amber-500/70"
                                    : "bg-white/20"
                              }`}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              <span>Temps restant: {formatTime(timeRemaining)}</span>
                            </div>
                          )}
                          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>Durée: {formatTime(timer)}</span>
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={((currentQuestion + 1) / selectedQuiz.questions.length) * 100}
                        className="h-2 mt-4"
                      />
                      <p className="text-sm text-white/80 mt-2">
                        Question {currentQuestion + 1} sur {selectedQuiz.questions.length}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-medium mb-6">{selectedQuiz.questions[currentQuestion].text}</h3>
                      <div className="space-y-4">
                        {selectedQuiz.questions[currentQuestion].options.map((option) => (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: option.id * 0.05 }}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedOptions[selectedQuiz.questions[currentQuestion].id] === option.id
                                ? `border-${selectedQuiz.color.split("-")[1]}-500 bg-${selectedQuiz.color.split("-")[1]}-50 dark:bg-${selectedQuiz.color.split("-")[1]}-900/20`
                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                            }`}
                            onClick={() => handleOptionSelect(selectedQuiz.questions[currentQuestion].id, option.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                  selectedOptions[selectedQuiz.questions[currentQuestion].id] === option.id
                                    ? `border-${selectedQuiz.color.split("-")[1]}-500 bg-${selectedQuiz.color.split("-")[1]}-500 text-white`
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {selectedOptions[selectedQuiz.questions[currentQuestion].id] === option.id && (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </div>
                              <span>{option.text}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800/90 p-6">
                      <Button variant="outline" onClick={resetQuiz} className="border-gray-300 dark:border-gray-600">
                        Abandonner
                      </Button>
                      <Button
                        onClick={handleNextQuestion}
                        disabled={!selectedOptions[selectedQuiz.questions[currentQuestion].id]}
                        className={`bg-gradient-to-r ${selectedQuiz.color} hover:shadow-lg transition-all`}
                      >
                        {currentQuestion < selectedQuiz.questions.length - 1 ? "Question Suivante" : "Terminer le Quiz"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="resultats">
            {quizCompleted && selectedQuiz && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="w-full max-w-3xl mx-auto bg-white/90 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader className={`bg-gradient-to-r ${selectedQuiz.color} text-white text-center`}>
                    <CardTitle className="flex justify-center items-center gap-2 text-2xl">
                      <Award className="h-8 w-8" />
                      Résultats du Quiz
                    </CardTitle>
                    <CardDescription className="text-white/80 text-lg">{selectedQuiz.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="text-center mb-8">
                      <motion.div
                        className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      >
                        <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                          {score}/{selectedQuiz.questions.length}
                        </span>
                      </motion.div>
                      <motion.h3
                        className="text-2xl font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {timeExpired
                          ? "Temps écoulé ! ⏱️"
                          : score === selectedQuiz.questions.length
                            ? "Parfait ! 🎉"
                            : score >= selectedQuiz.questions.length / 2
                              ? "Bon travail ! 👏"
                              : "Continuez à apprendre ! 💪"}
                      </motion.h3>
                      <motion.p
                        className="text-gray-500 mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        {timeExpired ? (
                          <span className="text-red-500">
                            Vous avez dépassé le temps limite de {formatTime(timeLimit)}
                          </span>
                        ) : (
                          `Temps total: ${formatTime(timer)}`
                        )}
                      </motion.p>
                    </div>

                    <Separator className="my-8" />

                    {timeExpired ? (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                        <h4 className="text-xl font-medium mb-2">Quiz non complété</h4>
                        <p className="text-gray-500 dark:text-gray-400">
                          Vous n'avez pas terminé le quiz dans le temps imparti. Votre score est de 0.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Essayez à nouveau pour améliorer votre temps de réponse.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <h4 className="font-medium text-lg">Révision des questions:</h4>
                        {selectedQuiz.questions.map((question, index) => {
                          const selectedOption = question.options.find((o) => o.id === selectedOptions[question.id])
                          const isCorrect = selectedOption?.correct === true
                          const correctOption = question.options.find((o) => o.correct === true)

                          return (
                            <motion.div
                              key={question.id}
                              className={`border rounded-lg p-5 ${isCorrect ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900" : "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900"}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 + index * 0.1 }}
                            >
                              <div className="flex items-start gap-3">
                                {isCorrect ? (
                                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-base">
                                    {index + 1}. {question.text}
                                  </p>
                                  <div className="mt-3 text-sm space-y-2">
                                    <p
                                      className={`${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} font-medium`}
                                    >
                                      Votre réponse: {selectedOption?.text || "Aucune réponse"}
                                    </p>
                                    {!isCorrect && (
                                      <p className="text-green-600 dark:text-green-400 font-medium mt-1">
                                        Réponse correcte: {correctOption?.text}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-center bg-gray-50 dark:bg-gray-800/90 p-6">
                    <Button
                      onClick={resetQuiz}
                      className={`bg-gradient-to-r ${selectedQuiz.color} hover:shadow-lg px-8 py-6 h-auto text-base`}
                    >
                      Retour aux Quiz
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}