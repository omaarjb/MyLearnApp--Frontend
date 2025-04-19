import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, BookOpen, Clock } from "lucide-react"
import { getIconComponent, getDifficultyColor } from "@/utils/quiz-utils"

export default function QuizCard({ quiz, index, startQuiz }) {
  return (
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
  )
}
