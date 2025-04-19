import { BookOpen, Brain, Zap, Target } from "lucide-react"

/**
 * Returns the appropriate icon component based on the provided icon name
 * @param {string} iconName - Name of the icon to display
 * @returns {JSX.Element} The React icon component
 */
export const getIconComponent = (iconName) => {
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

/**
 * Returns a CSS class for coloring based on difficulty level
 * @param {string} difficulty - The difficulty level
 * @returns {string} CSS class string
 */
export const getDifficultyColor = (difficulty) => {
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

/**
 * Extracts the base color name from color scheme string
 * @param {string} colorScheme - The color scheme string (e.g. "from-purple-500")
 * @returns {string} Base color name (e.g. "purple")
 */
export const extractColorBase = (colorScheme) => {
  if (!colorScheme) return "purple"
  
  const parts = colorScheme.split("-")
  return parts.length > 1 ? parts[1] : "purple"
}