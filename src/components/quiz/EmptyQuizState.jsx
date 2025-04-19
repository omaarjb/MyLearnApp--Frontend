import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function EmptyQuizState({ clearFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 bg-white/80 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm"
    >
      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-medium mb-2">Aucun quiz trouvé</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Aucun quiz ne correspond à vos critères de recherche.
      </p>
      <Button variant="outline" onClick={clearFilters}>
        Réinitialiser les filtres
      </Button>
    </motion.div>
  )
}