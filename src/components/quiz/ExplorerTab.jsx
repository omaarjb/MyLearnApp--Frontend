import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import FilterPanel from "./FilterPanel"
import QuizCard from "./QuizCard"
import EmptyQuizState from "./EmptyQuizState"

export default function ExplorerTab({ quizzes, startQuiz }) {
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    category: "",
    professor: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const uniqueDifficulties = [...new Set(quizzes.map((quiz) => quiz.difficulty))]
  const uniqueCategories = [...new Set(quizzes.map((quiz) => quiz.category))]
  const uniqueProfessors = [
    ...new Set(
      quizzes
        .map((quiz) => (quiz.professor ? `${quiz.professor.firstName} ${quiz.professor.lastName}` : null))
        .filter(Boolean),
    ),
  ]

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
    <div className="w-full mx-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <FilterPanel
            filters={filters}
            handleFilterChange={handleFilterChange}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            clearFilters={clearFilters}
            uniqueDifficulties={uniqueDifficulties}
            uniqueCategories={uniqueCategories}
            uniqueProfessors={uniqueProfessors}
          />
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <EmptyQuizState clearFilters={clearFilters} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.map((quiz, index) => (
            <QuizCard key={quiz.id} quiz={quiz} index={index} startQuiz={startQuiz} />
          ))}
        </motion.div>
      )}
    </div>
  )
}