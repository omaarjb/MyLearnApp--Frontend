import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle } from "lucide-react"
import { getIconComponent } from "@/utils/quiz-utils"

export default function QuizTab({
  selectedQuiz,
  currentQuestion,
  selectedOptions,
  timer,
  handleOptionSelect,
  handleNextQuestion,
  resetQuiz,
  formatTime,
}) {
  return (
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
            <OptionsList 
              question={selectedQuiz.questions[currentQuestion]} 
              selectedOptionId={selectedOptions[selectedQuiz.questions[currentQuestion].id]} 
              quizColor={selectedQuiz.color}
              handleOptionSelect={handleOptionSelect}
            />
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
  )
}