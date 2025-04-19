"use client"

import { useState, useEffect } from "react"
import { BarChart, Activity, Users, BookOpen, Award, Calendar, Clock, ArrowUp, ArrowDown } from "lucide-react"

export default function StatsDisplay({ user }) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sample data - in a real app, you would fetch this from your database
  const studentStats = {
    completedQuizzes: 24,
    averageScore: 85,
    streak: 7,
    totalPoints: 1250,
    rank: 12,
    timeSpent: "32h 45m",
    recentScores: [75, 90, 82, 95, 88],
    improvement: 12,
  }

  const professorStats = {
    totalStudents: 128,
    activeStudents: 98,
    averageClassScore: 78,
    quizzesCreated: 15,
    completionRate: 76,
    topPerformers: 32,
    strugglingStudents: 18,
    engagementRate: 84,
  }

  useEffect(() => {
    if (user) {
      // Get the user's role from metadata
      setRole(user.publicMetadata.role || "student")
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement de vos statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
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
        </header>

        {role === "student" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student Stats Cards */}
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
              title="Série Actuelle"
              value={studentStats.streak}
              icon={<Award className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Points Totaux"
              value={studentStats.totalPoints}
              icon={<BarChart className="h-5 w-5 text-purple-600" />}
            />

            {/* Recent Performance */}
            <div className="col-span-full bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Performance Récente</h2>
              <div className="flex items-end h-40 gap-2">
                {studentStats.recentScores.map((score, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-sm"
                      style={{ height: `${score}%` }}
                    ></div>
                    <span className="text-xs mt-2">Quiz {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Stats */}
            <StatCard
              title="Classement Actuel"
              value={`#${studentStats.rank}`}
              icon={<Users className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Temps Passé"
              value={studentStats.timeSpent}
              icon={<Clock className="h-5 w-5 text-purple-600" />}
            />
            <StatCard
              title="Cette Semaine"
              value={`${studentStats.improvement}% ↑`}
              icon={<ArrowUp className="h-5 w-5 text-green-600" />}
              color="text-green-600"
            />
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

           
            <div className="col-span-full md:col-span-2 bg-white/90 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Activité Récente</h2>
              <div className="space-y-4">
                <ActivityItem
                  title="Quiz: Structures de Données"
                  description="12 étudiants ont terminé"
                  time="Il y a 2 heures"
                />
                <ActivityItem title="Devoir: Algorithmes" description="8 soumissions reçues" time="Hier" />
                <ActivityItem
                  title="Nouvel Étudiant"
                  description="Emma Johnson a rejoint votre classe"
                  time="Il y a 2 jours"
                />
                <ActivityItem
                  title="Quiz: Bases de Programmation"
                  description="Tous les étudiants ont terminé"
                  time="Il y a 3 jours"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
