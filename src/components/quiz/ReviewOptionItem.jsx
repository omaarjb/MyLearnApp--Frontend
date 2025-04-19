"use client"

import { CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function ReviewOptionItem({ 
  question, 
  index, 
  selectedOptionId
}) {
  const selectedOption = question.options.find(o => o.id === selectedOptionId)
  const isCorrect = selectedOption?.correct === true
  const correctOption = question.options.find(o => o.correct === true)

  return (
    <motion.div
      className={`border rounded-lg p-5 ${
        isCorrect 
          ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900" 
          : "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900"
      }`}
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
            <p className={`${
              isCorrect 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
              } font-medium`}
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
}
