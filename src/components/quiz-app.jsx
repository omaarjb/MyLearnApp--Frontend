"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, BarChart3 } from "lucide-react"
import Navbar from "@/components/navbar"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-windows-size"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

import ExplorerTab from "@/components/quiz/ExplorerTab"
import QuizTab from "@/components/quiz/QuizTab"
import ResultsTab from "@/components/quiz/ResultsTab"
import LoadingSpinner from "@/components/quiz/LoadingSpinner"
import ErrorAlert from "@/components/quiz/ErrorAlert"

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
  const [currentAttemptId, setCurrentAttemptId] = useState(null)
  const { userId } = useAuth()
  const { toast } = useToast()

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

  useEffect(() => {
    let interval = null
    if (timerActive) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1)
      }, 1000)
    } else if (!timerActive && timer !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerActive, timer])

  // Reset state when switching to explorer tab
  useEffect(() => {
    if (activeTab === "explorer" && !timerActive) {
      setSelectedQuiz(null)
      setQuizCompleted(false)
    }
  }, [activeTab, timerActive])

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
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start quiz attempt")
      }

      const data = await response.json()
      setCurrentAttemptId(data.attemptId)

      setSelectedQuiz(quiz)
      setCurrentQuestion(0)
      setSelectedOptions({})
      setQuizCompleted(false)
      setScore(0)
      setTimer(0)
      setTimerActive(true)
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
      // Submit the quiz attempt
      try {
        setLoading(true)

        // Convert selectedOptions to the format expected by the API
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
  }

  const resetQuiz = () => {
    setActiveTab("explorer")
    setSelectedQuiz(null)
    setQuizCompleted(false)
    setCurrentAttemptId(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      <Navbar />

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

          {loading && <LoadingSpinner />}

          {error && <ErrorAlert message={error} />}

          <TabsContent value="explorer" className="space-y-6">
            <ExplorerTab
              quizzes={quizzes}
              startQuiz={startQuiz}
            />
          </TabsContent>

          <TabsContent value="quiz">
            {selectedQuiz && !quizCompleted && (
              <QuizTab
                selectedQuiz={selectedQuiz}
                currentQuestion={currentQuestion}
                selectedOptions={selectedOptions}
                timer={timer}
                handleOptionSelect={handleOptionSelect}
                handleNextQuestion={handleNextQuestion}
                resetQuiz={resetQuiz}
                formatTime={formatTime}
              />
            )}
          </TabsContent>

          <TabsContent value="resultats">
            {quizCompleted && selectedQuiz && (
              <ResultsTab
                selectedQuiz={selectedQuiz}
                score={score}
                timer={timer}
                selectedOptions={selectedOptions}
                resetQuiz={resetQuiz}
                formatTime={formatTime}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}