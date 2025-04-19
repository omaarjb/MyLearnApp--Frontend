export const getIconComponent = (iconName) => {
    const { Brain, Zap, Target, BookOpen } = require("lucide-react")
    
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