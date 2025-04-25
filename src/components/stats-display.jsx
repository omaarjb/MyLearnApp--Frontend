"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { BarChart, Activity, Users, BookOpen, Award, Calendar, ArrowDown, Filter, ChevronDown } from "lucide-react"

export default function StatsPage() {
  const { user, isLoaded } = useUser()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizAttempts, setQuizAttempts] = useState([])
  const [error, setError] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false)
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false)
  const [topics, setTopics] = useState(["all"])
  const [emptyState, setEmptyState] = useState(false)

  const grades = ["all", "A", "B", "C", "D", "F"]

  // Sample data for when the API is not available
  const sampleQuizData = [
    {
      id: 1,
      quizId: 101,
      quizTitle: "Algèbre linéaire",
      topic: "mathématiques",
      score: 92,
      totalQuestions: 10,
      timeTakenSeconds: 600,
      startTime: "2023-04-15T10:00:00",
      endTime: "2023-04-15T10:10:00",
    },
    {
      id: 2,
      quizId: 102,
      quizTitle: "Chimie organique",
      topic: "sciences",
      score: 85,
      totalQuestions: 15,
      timeTakenSeconds: 900,
      startTime: "2023-04-18T14:00:00",
      endTime: "2023-04-18T14:15:00",
    },
    {
      id: 3,
      quizId: 103,
      quizTitle: "Révolution française",
      topic: "histoire",
      score: 95,
      totalQuestions: 12,
      timeTakenSeconds: 720,
      startTime: "2023-04-20T09:30:00",
      endTime: "2023-04-20T09:42:00",
    },
    {
      id: 4,
      quizId: 104,
      quizTitle: "Grammaire anglaise",
      topic: "langues",
      score: 78,
      totalQuestions: 20,
      timeTakenSeconds: 1200,
      startTime: "2023-04-22T16:00:00",
      endTime: "2023-04-22T16:20:00",
    },
    {
      id: 5,
      quizId: 105,
      quizTitle: "Structures de données",
      topic: "informatique",
      score: 90,
      totalQuestions: 15,
      timeTakenSeconds: 900,
      startTime: "2023-04-25T11:00:00",
      endTime: "2023-04-25T11:15:00",
    },
  ]

  // Convert score to letter grade
  const getGradeFromScore = (score) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // Fetch quiz attempts from the backend
  const quizCategoryMapping = {
    3: "Programming",
    5: "Java Programming",
    6: "General Knowledge",
  }

  useEffect(() => {
    if (user && isLoaded) {
      setRole(user.publicMetadata.role || "student")
      const clerkId = user.id

      fetch(`http://localhost:8080/api/quiz-attempts/user/${clerkId}`)
        .then(async (response) => {
          const text = await response.text()

          if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
            console.error("HTML response received:", text)
            throw new Error("Received HTML instead of JSON. Backend may be unavailable.")
          }

          try {
            return JSON.parse(text)
          } catch (e) {
            console.error("Failed to parse JSON:", e)
            throw new Error("Invalid JSON response from server")
          }
        })
        .then((data) => {
          console.log("API response data:", data)

          if (!Array.isArray(data) || data.length === 0) {
            setQuizAttempts([])
            setTopics(["all"])
            setEmptyState(true)
          } else {
            const attemptsWithGrades = data.map((attempt) => ({
              ...attempt,
              topic: attempt.quizCategory || "non-catégorisé",

              grade: getGradeFromScore(attempt.score),
            }))

            setQuizAttempts(attemptsWithGrades)

            const uniqueTopics = [
              "all",
              ...new Set(attemptsWithGrades.map((attempt) => attempt.topic || "non-catégorisé")),
            ]
            setTopics(uniqueTopics)
            setEmptyState(false)
          }

          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching quiz attempts:", error.message)
          setError(error.message)

          const attemptsWithGrades = sampleQuizData.map((attempt) => ({
            ...attempt,
            grade: getGradeFromScore(attempt.score),
          }))

          setQuizAttempts(attemptsWithGrades)

          const uniqueTopics = [
            "all",
            ...new Set(attemptsWithGrades.map((attempt) => attempt.topic || "non-catégorisé")),
          ]
          setTopics(uniqueTopics)

          setLoading(false)
        })
    }
  }, [user, isLoaded])

  const filteredQuizAttempts = quizAttempts.filter((attempt) => {
    const topicMatch = selectedTopic === "all" || attempt.topic === selectedTopic
    const gradeMatch = selectedGrade === "all" || attempt.grade === selectedGrade
    return topicMatch && gradeMatch
  })

  const calculateStats = () => {
    if (filteredQuizAttempts.length === 0) {
      return {
        completedQuizzes: 0,
        averageScore: 0,
        bestGrade: "-",
        totalPoints: 0,
      }
    }

    const totalScore = filteredQuizAttempts.reduce((sum, attempt) => sum + attempt.score, 0)
    const averageScore = Math.round(totalScore / filteredQuizAttempts.length)
    const bestAttempt = filteredQuizAttempts.reduce(
      (best, attempt) => (attempt.score > best.score ? attempt : best),
      filteredQuizAttempts[0],
    )

    return {
      completedQuizzes: filteredQuizAttempts.length,
      averageScore: averageScore,
      bestGrade: bestAttempt.grade || getGradeFromScore(bestAttempt.score),
      totalPoints: totalScore,
    }
  }

  const studentStats = calculateStats()

  const calculateProfessorStats = () => {
    return {
      totalStudents: 0,
      activeStudents: 0,
      averageClassScore: 0,
      quizzesCreated: 0,
      completionRate: 0,
      topPerformers: 0,
      strugglingStudents: 0,
      engagementRate: 0,
    }
  }

  const professorStats = calculateProfessorStats()

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement de vos statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Vos Statistiques
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {role === "student"
              ? "Suivez votre progression et vos réalisations"
              : "Surveillez la performance de votre classe et l'engagement des étudiants"}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              Note: Utilisation de données d'exemple. {error}
            </div>
          )}
        </header>

        {role === "student" && (
  <div className="mb-8 bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-4" style={{ position: 'relative', zIndex: 20 }}>
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium">Filtrer par:</span>
              </div>

              {/* Topic Filter */}
              <div className="relative" style={{ zIndex: 30 }}>
  <button
    onClick={() => {
      setIsTopicDropdownOpen(!isTopicDropdownOpen)
      setIsGradeDropdownOpen(false)
    }}
    className="flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
  >
    <span>
      Sujet:{" "}
      {selectedTopic === "all" ? "Tous" : selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}
    </span>
    <ChevronDown className="w-4 h-4 ml-2" />
  </button>
  {isTopicDropdownOpen && (
    <div className="absolute w-48 mt-1 bg-white rounded-md shadow-lg dark:bg-gray-700" style={{ zIndex: 40 }}>
      <ul className="py-1 overflow-auto text-base">
        {topics.map((topic) => (
          <li
            key={topic}
            onClick={() => {
              setSelectedTopic(topic)
              setIsTopicDropdownOpen(false)
            }}
            className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
              selectedTopic === topic
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : ""
            }`}
          >
            {topic === "all" ? "Tous les sujets" : topic.charAt(0).toUpperCase() + topic.slice(1)}
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

              {/* Grade Filter */}
              <div className="relative" style={{ zIndex: 30 }}>
  <button
    onClick={() => {
      setIsGradeDropdownOpen(!isGradeDropdownOpen)
      setIsTopicDropdownOpen(false)
    }}
    className="flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
  >
    <span>Note: {selectedGrade === "all" ? "Toutes" : selectedGrade}</span>
    <ChevronDown className="w-4 h-4 ml-2" />
  </button>
  {isGradeDropdownOpen && (
    <div className="absolute w-48 mt-1 bg-white rounded-md shadow-lg dark:bg-gray-700" style={{ zIndex: 40 }}>
      <ul className="py-1 overflow-auto text-base">
        {grades.map((grade) => (
          <li
            key={grade}
            onClick={() => {
              setSelectedGrade(grade)
              setIsGradeDropdownOpen(false)
            }}
            className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
              selectedGrade === grade
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : ""
            }`}
          >
            {grade === "all" ? "Toutes les notes" : grade}
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
            </div>
          </div>
        )}

        {role === "student" ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Quiz Complétés"
              value={studentStats.completedQuizzes}
              icon={<BookOpen className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Score Moyen"
              value={`${studentStats.averageScore}%`}
              icon={<Activity className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Meilleure Note"
              value={studentStats.bestGrade}
              icon={<Award className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Points Totaux"
              value={studentStats.totalPoints}
              icon={<BarChart className="h-5 w-5 text-purple-600" />}
            />

            {/* Quiz List */}
            <div className="col-span-full bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Résultats des Quiz</h2>
              {filteredQuizAttempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Quiz
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Sujet
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Note
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Score
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Time Taken
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {filteredQuizAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.quizTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {attempt.topic && attempt.topic.charAt(0).toUpperCase() + attempt.topic.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                attempt.grade === "A"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : attempt.grade === "B"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : attempt.grade === "C"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                      : attempt.grade === "D"
                                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {attempt.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {attempt.score}/{attempt.totalQuestions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {attempt.timeTakenSeconds} sec
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(attempt.endTime).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucun quiz ne correspond aux filtres sélectionnés.
                </div>
              )}
            </div>

            {/* Performance by Topic */}
            {filteredQuizAttempts.length > 0 && (
              <div className="col-span-full md:col-span-2 bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Performance par Sujet</h2>
                <div className="space-y-4">
                  {Array.from(new Set(filteredQuizAttempts.map((attempt) => attempt.topic))).map((topic) => {
                    if (!topic) return null
                    const topicAttempts = filteredQuizAttempts.filter((attempt) => attempt.topic === topic)
                    const avgScore = Math.round(
                      topicAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / topicAttempts.length,
                    )

                    return (
                      <div key={topic}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm capitalize">{topic}</span>
                          <span className="text-sm font-semibold">{avgScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full"
                            style={{ width: `${avgScore}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Grade Distribution */}
            {filteredQuizAttempts.length > 0 && (
              <div className="col-span-full md:col-span-2 bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Distribution des Notes</h2>
                <div className="space-y-4">
                  {grades
                    .filter((grade) => grade !== "all")
                    .map((grade) => {
                      const gradeCount = filteredQuizAttempts.filter((attempt) => attempt.grade === grade).length
                      const percentage =
                        filteredQuizAttempts.length > 0
                          ? Math.round((gradeCount / filteredQuizAttempts.length) * 100)
                          : 0

                      return (
                        <div key={grade}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Note {grade}</span>
                            <span className="text-sm font-semibold">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                grade === "A"
                                  ? "bg-green-500"
                                  : grade === "B"
                                    ? "bg-blue-500"
                                    : grade === "C"
                                      ? "bg-yellow-500"
                                      : grade === "D"
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Professor Stats Cards */}
            <StatCard
              title="Total Étudiants"
              value={professorStats.totalStudents}
              icon={<Users className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Étudiants Actifs"
              value={professorStats.activeStudents}
              icon={<Activity className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Score Moyen"
              value={`${professorStats.averageClassScore}%`}
              icon={<BarChart className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Quiz Créés"
              value={professorStats.quizzesCreated}
              icon={<BookOpen className="h-5 w-5 text-purple-600" />}
            />

            {/* Class Performance */}
            <div className="col-span-full bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Performance de la Classe</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PerformanceCard
                  title="Taux de Complétion"
                  value={`${professorStats.completionRate}%`}
                  icon={<Calendar className="h-5 w-5" />}
                />
                <PerformanceCard
                  title="Meilleurs Élèves"
                  value={professorStats.topPerformers}
                  icon={<Award className="h-5 w-5" />}
                />
                <PerformanceCard
                  title="Élèves en Difficulté"
                  value={professorStats.strugglingStudents}
                  icon={<ArrowDown className="h-5 w-5" />}
                />
                <PerformanceCard
                  title="Taux d'Engagement"
                  value={`${professorStats.engagementRate}%`}
                  icon={<Activity className="h-5 w-5" />}
                />
              </div>
            </div>

            {/* Student Distribution */}
            <div className="col-span-full md:col-span-2 bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Distribution des Scores</h2>
              <div className="space-y-4">
                <ScoreBar label="90-100%" percentage={15} />
                <ScoreBar label="80-89%" percentage={35} />
                <ScoreBar label="70-79%" percentage={25} />
                <ScoreBar label="60-69%" percentage={15} />
                <ScoreBar label="Below 60%" percentage={10} />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-span-full md:col-span-2 bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Activité Récente</h2>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Les données d'activité récente seront disponibles prochainement.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon, color = "text-gray-900 dark:text-white" }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">{icon}</div>
      </div>
    </div>
  )
}

// Performance Card Component
function PerformanceCard({ title, value, icon }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center text-center">
      <div className="mb-2 text-purple-600">{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  )
}

// Score Bar Component
function ScoreBar({ label, percentage }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// Activity Item Component
function ActivityItem({ title, description, time }) {
  return (
    <div className="flex items-start">
      <div className="h-2 w-2 mt-2 rounded-full bg-purple-600 mr-3"></div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  )
}