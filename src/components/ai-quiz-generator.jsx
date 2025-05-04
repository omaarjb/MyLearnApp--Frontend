"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const NUM_QUESTIONS_OPTIONS = [3, 5, 8, 10, 15]
const DIFFICULTY_LEVELS = ["Débutant", "Intermédiaire", "Avancé"]

export default function AIQuizGenerator({ isOpen, onClose, onQuizGenerated, userId }) {
  const [activeTab, setActiveTab] = useState("topic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [topic, setTopic] = useState("")
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState("Intermédiaire")
  const [textContent, setTextContent] = useState("")
  const [generationError, setGenerationError] = useState("")
  const { toast } = useToast()
  const API_BASE_URL = "http://localhost:8080"


  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationError("")

    try {
      let content = ""
      let sourceType = ""

      // Determine the source of content for quiz generation
      if (activeTab === "topic") {
        if (!topic.trim()) {
          throw new Error("Veuillez entrer un sujet pour générer le quiz.")
        }
        content = topic
        sourceType = "topic"
      } else if (activeTab === "text") {
        if (!textContent.trim()) {
          throw new Error("Veuillez entrer du texte pour générer le quiz.")
        }
        content = textContent
        sourceType = "text"
      }

      // Call the backend API to generate the quiz
      const response = await fetch(`${API_BASE_URL}/api/quizzes/generate-with-ai?professorId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceType,
          content,
          numQuestions,
          difficulty,
          category: "Programmation", // Default category, can be improved
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de la génération du quiz.")
      }

      const generatedQuiz = await response.json()

      // Pass the generated quiz back to the parent component
      onQuizGenerated(generatedQuiz)

      toast({
        title: "Quiz généré avec succès!",
        description: `${numQuestions} questions ont été créées sur le sujet.`,
      })

      onClose()
    } catch (error) {
      console.error("Error generating quiz:", error)
      setGenerationError(error.message || "Une erreur s'est produite lors de la génération du quiz.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Générer un Quiz avec l'IA
          </DialogTitle>
          <DialogDescription>
            Laissez l'IA créer un quiz complet pour vous à partir d'un sujet ou de texte.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="topic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="topic">Sujet</TabsTrigger>
            <TabsTrigger value="text">Texte</TabsTrigger>
          </TabsList>

          <TabsContent value="topic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Sujet du Quiz</Label>
              <Textarea
                id="topic"
                placeholder="Ex: Les bases de Java, Les frameworks JavaScript, L'architecture des microservices..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Contenu Textuel</Label>
              <Textarea
                id="text-content"
                placeholder="Collez le texte à partir duquel vous souhaitez générer un quiz..."
                className="min-h-[200px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="num-questions">Nombre de questions</Label>
            <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {NUM_QUESTIONS_OPTIONS.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} questions
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Niveau de difficulté</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {generationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Annuler
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Générer le Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
