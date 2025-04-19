import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

export default function FilterPanel({
  filters,
  handleFilterChange,
  showFilters,
  setShowFilters,
  clearFilters,
  uniqueDifficulties,
  uniqueCategories,
  uniqueProfessors,
}) {
  return (
    <>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher un quiz..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10 bg-white/80 dark:bg-gray-800/60"
        />
      </div>
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/60"
      >
        <Filter className="h-4 w-4" />
        Filtres
        {(filters.difficulty || filters.category || filters.professor) && (
          <Badge
            variant="secondary"
            className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
          >
            {Object.values(filters).filter(Boolean).length - (filters.search ? 1 : 0)}
          </Badge>
        )}
      </Button>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/90 dark:bg-gray-800/80 rounded-lg p-4 mb-6 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filtrer les quiz</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              Effacer les filtres
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulté</label>
              <Select
                value={filters.difficulty}
                onValueChange={(value) => handleFilterChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les difficultés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les difficultés</SelectItem>
                  {uniqueDifficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Professeur</label>
              <Select
                value={filters.professor}
                onValueChange={(value) => handleFilterChange("professor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les professeurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les professeurs</SelectItem>
                  {uniqueProfessors.map((professor) => (
                    <SelectItem key={professor} value={professor}>
                      {professor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}