"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Clock, Award, BookOpen, BarChart3, Brain, Zap, Target } from "lucide-react"
import Navbar from "@/components/navbar"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-windows-size"

// Mock data - this would come from your Spring Boot backend
const mockQuizzes = [
  {
    id: 1,
    title: "Introduction à Java",
    description: "Testez vos connaissances sur les bases de Java",
    category: "Programmation",
    difficulty: "Débutant",
    icon: "Brain",
    color: "from-emerald-500 to-teal-600",
    questions: [
      {
        id: 1,
        text: "Quelle est la syntaxe correcte pour déclarer une variable entière en Java?",
        options: [
          { id: 1, text: "int x = 10;" },
          { id: 2, text: "integer x = 10;" },
          { id: 3, text: "var x = 10;" },
          { id: 4, text: "Int x = 10;" },
        ],
        correctOptionId: 1,
      },
      {
        id: 2,
        text: "Comment déclarer un tableau en Java?",
        options: [
          { id: 1, text: "int[] numbers = new int[5];" },
          { id: 2, text: "array numbers = new array(5);" },
          { id: 3, text: "int numbers = new int[5];" },
          { id: 4, text: "int numbers[] = int[5];" },
        ],
        correctOptionId: 1,
      },
      {
        id: 3,
        text: "Quelle est la méthode principale pour démarrer un programme Java?",
        options: [
          { id: 1, text: "public static void main(String[] args)" },
          { id: 2, text: "public void main(String[] args)" },
          { id: 3, text: "public static main(String[] args)" },
          { id: 4, text: "static void main(String args)" },
        ],
        correctOptionId: 1,
      },
    ],
  },
  {
    id: 2,
    title: "Spring Boot Fondamentaux",
    description: "Les concepts essentiels de Spring Boot",
    category: "Framework",
    difficulty: "Intermédiaire",
    icon: "Zap",
    color: "from-violet-500 to-purple-600",
    questions: [
      {
        id: 1,
        text: "Quelle annotation est utilisée pour définir un contrôleur REST dans Spring Boot?",
        options: [
          { id: 1, text: "@RestController" },
          { id: 2, text: "@Controller" },
          { id: 3, text: "@APIController" },
          { id: 4, text: "@RESTMapping" },
        ],
        correctOptionId: 1,
      },
      {
        id: 2,
        text: "Comment injecter une dépendance dans Spring Boot?",
        options: [
          { id: 1, text: "@Autowired" },
          { id: 2, text: "@Inject" },
          { id: 3, text: "@DependencyInject" },
          { id: 4, text: "@Resource" },
        ],
        correctOptionId: 1,
      },
    ],
  },
  {
    id: 3,
    title: "React Avancé",
    description: "Maîtrisez les concepts avancés de React",
    category: "Frontend",
    difficulty: "Avancé",
    icon: "Target",
    color: "from-rose-500 to-pink-600",
    questions: [
      {
        id: 1,
        text: "Qu'est-ce que le React Context API permet de faire?",
        options: [
          { id: 1, text: "Partager des données entre des composants sans prop drilling" },
          { id: 2, text: "Optimiser les performances de rendu" },
          { id: 3, text: "Créer des animations fluides" },
          { id: 4, text: "Gérer les appels API" },
        ],
        correctOptionId: 1,
      },
      {
        id: 2,
        text: "Quel hook permet d'exécuter du code après le rendu?",
        options: [
          { id: 1, text: "useEffect" },
          { id: 2, text: "useState" },
          { id: 3, text: "useCallback" },
          { id: 4, text: "useMemo" },
        ],
        correctOptionId: 1,
      },
    ],
  },
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

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true)
        //const data = await fetchQuizzes()
        setQuizzes(mockQuizzes) // Use mockQuizzes for now
        setError(null)
      } catch (err) {
        setError("Impossible de charger les quiz. Veuillez réessayer plus tard.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadQuizzes()
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

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentQuestion(0)
    setSelectedOptions({})
    setQuizCompleted(false)
    setScore(0)
    setTimer(0)
    setTimerActive(true)
    setActiveTab("quiz")
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
      // Soumettre le quiz au backend
      try {
        setLoading(true)
        //const result = await submitQuiz(selectedQuiz.id, selectedOptions)
        const result = {
          correctAnswers: selectedQuiz.questions.filter((q) => selectedOptions[q.id] === q.correctOptionId).length,
        }
        setScore(result.correctAnswers)
        setQuizCompleted(true)
        setTimerActive(false)
        setActiveTab("resultats") // Add this line to switch to results tab

        // Show confetti if score is good
        if (result.correctAnswers >= selectedQuiz.questions.length * 0.7) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 5000)
        }
      } catch (err) {
        setError("Erreur lors de la soumission du quiz")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const resetQuiz = () => {
    setActiveTab("explorer")
    setSelectedQuiz(null)
    setQuizCompleted(false)
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {quizzes.map((quiz, index) => (
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
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="h-4 w-4" />
                          <span>{quiz.questions.length} questions</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>~{quiz.questions.length * 30} sec</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="">
                      <Button
                        className={`w-full bg-gradient-to-r ${quiz.color} hover:shadow-lg hover:shadow-${quiz.color.split("-")[1]}-500/20`}
                        onClick={() => startQuiz(quiz)}
                      >
                        Commencer le Quiz
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
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
                        <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{formatTime(timer)}</span>
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
                            transition={{ duration: 0.2, delay: option.id * 0.1 }}
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
                        className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-${selectedQuiz.color.split("-")[1]}-100 dark:bg-${selectedQuiz.color.split("-")[1]}-900/30 mb-4`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      >
                        <span
                          className={`text-4xl font-bold text-${selectedQuiz.color.split("-")[1]}-600 dark:text-${selectedQuiz.color.split("-")[1]}-300`}
                        >
                          {score}/{selectedQuiz.questions.length}
                        </span>
                      </motion.div>
                      <motion.h3
                        className="text-2xl font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {score === selectedQuiz.questions.length
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
                        Temps total: {formatTime(timer)}
                      </motion.p>
                    </div>

                    <Separator className="my-8" />

                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h4 className="font-medium text-lg">Révision des questions:</h4>
                      {selectedQuiz.questions.map((question, index) => {
                        const isCorrect = selectedOptions[question.id] === question.correctOptionId
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
                                    Votre réponse:{" "}
                                    {question.options.find((o) => o.id === selectedOptions[question.id])?.text ||
                                      "Aucune réponse"}
                                  </p>
                                  {!isCorrect && (
                                    <p className="text-green-600 dark:text-green-400 font-medium mt-1">
                                      Réponse correcte:{" "}
                                      {question.options.find((o) => o.id === question.correctOptionId).text}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
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

