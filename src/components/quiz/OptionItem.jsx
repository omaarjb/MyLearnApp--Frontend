"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

export default function OptionItem({ 
  option, 
  isSelected, 
  onSelect, 
  colorScheme = "purple", 
  disabled = false 
}) {
  // Extract color base (purple, blue, etc) from colorScheme strings like "from-purple-500"
  const colorBase = colorScheme.split("-")[1] || "purple"
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: option.id * 0.05 }}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${
        isSelected
          ? `border-${colorBase}-500 bg-${colorBase}-50 dark:bg-${colorBase}-900/20`
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
      }`}
      onClick={() => !disabled && onSelect(option.id)}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
            isSelected
              ? `border-${colorBase}-500 bg-${colorBase}-500 text-white`
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {isSelected && <CheckCircle className="h-4 w-4" />}
        </div>
        <span>{option.text}</span>
      </div>
    </motion.div>
  )
}