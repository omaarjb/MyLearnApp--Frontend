// src/components/quiz/ResultsTab.jsx
"use client"

import { motion } from "framer-motion"
import { Award } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ReviewOptionList from "./ReviewOptionList"

export default function ResultsTab({
  selectedQuiz,
  score,
  timer,
  selectedOptions,
  resetQuiz,
  formatTime
}) {
  return (
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <ReviewOptionList 
              questions={selectedQuiz.questions}
              selectedOptions={selectedOptions}
            />
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
  )
}