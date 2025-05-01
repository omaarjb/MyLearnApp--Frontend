"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Brain, BookOpen, Users, PlusCircle, Zap, Sparkles,ChartBar } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Accueil() {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // Redirect to landing page if not logged in
        router.push("/")
        return
      }

      // Get user role
      const role = user.unsafeMetadata?.role || "student"
      setUserRole(role)
    }
  }, [isLoaded, user, router])

  // Determine if user is a student
  const isStudent = userRole === "student"

  if (!isLoaded || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <Navbar />

      {/* Decorative background elements */}
      <div className="absolute top-24 right-10 w-64 h-64 bg-purple-400/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-pink-400/10 rounded-full filter blur-3xl" />

      <main className="relative container mx-auto px-4 py-12 md:py-16 flex flex-col items-center">
        {/* Welcome Header */}
        <section className="mb-12 text-center w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-70"
            />

            <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
              Bienvenue,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                {user?.firstName || ""}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {isStudent
                ? "Prêt à améliorer vos connaissances ? Commencez un quiz ou explorez nos ressources d'apprentissage."
                : "Prêt à engager vos étudiants ? Créez un nouveau quiz ou gérez vos contenus existants."}
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-70"
            />
          </motion.div>
        </section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 w-full max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <Card className="relative border-none shadow-lg h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full"></div>
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 mb-6 relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                    ></motion.div>
                    {isStudent ? (
                      <Brain className="h-10 w-10 text-purple-600" />
                    ) : (
                      <PlusCircle className="h-10 w-10 text-purple-600" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-2 dark:text-white">
                    {isStudent ? "Commencer un Quiz" : "Créer un Quiz"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {isStudent
                      ? "Testez vos connaissances avec nos quiz interactifs sur divers sujets."
                      : "Créez des quiz personnalisés pour évaluer les connaissances de vos étudiants."}
                  </p>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 relative overflow-hidden group"
                    onClick={() => router.push(isStudent ? "/quiz" : "/create-quiz")}
                  >
                    <span className="relative z-10">
                      {isStudent ? "Voir les Quiz" : "Nouveau Quiz"}
                      <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-20 rounded-md"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <Card className="relative border-none shadow-lg h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full"></div>
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 mb-6 relative">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                    ></motion.div>
                    {isStudent ? (
                      <ChartBar className="h-10 w-10 text-purple-600" />
                    ) : (
                      <BookOpen className="h-10 w-10 text-purple-600" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-2 dark:text-white">
                    {isStudent ? "Mes Statistiques" : "Mes Quiz"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {isStudent
                      ? "Consultez vos statistiques et les résultats de vos quiz."
                      : "Consultez, modifiez, ajoutez ou supprimez vos quizzes et leurs questions en toute simplicité."} 
                  </p>
                  <Button
                    variant="outline"
                    className="border-purple-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-gray-600 relative overflow-hidden group"
                    onClick={() => router.push(isStudent ? "/stats" : "/quizzes")}
                  >
                    <span className="relative z-10">
                      {isStudent ? "Voir votre statistiques" : "Voir mes quizzes"}
                      <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 rounded-md"
                      initial={{ y: "100%" }}
                      whileHover={{ y: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Featured Content */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-6xl"
        >
          <div className="text-center mb-10 relative">
            <Sparkles className="absolute -top-8 left-1/2 transform -translate-x-1/2 h-6 w-6 text-purple-500 opacity-70" />
            <h2 className="text-2xl font-bold dark:text-white">
              {isStudent ? "Quiz populaires" : "Ressources pédagogiques"}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(isStudent ? studentFeatured : professorFeatured).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/40 to-pink-600/40 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                <Card className="relative border-none shadow-md hover:shadow-lg transition-all h-full rounded-xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 w-fit mb-4">{item.icon}</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600 transition-colors dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        {item.tag}
                      </span>
                      <motion.div initial={{ x: 0 }} whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
      <Footer/>
    </div>
  )
}

// Featured content for students
const studentFeatured = [
  {
    title: "Les bases de JavaScript",
    description: "Apprenez les fondamentaux de JavaScript avec ce quiz interactif.",
    tag: "Débutant",
    icon: <Zap className="h-5 w-5 text-purple-600" />,
  },
  {
    title: "CSS Avancé",
    description: "Testez vos connaissances sur les fonctionnalités avancées de CSS.",
    tag: "Intermédiaire",
    icon: <Brain className="h-5 w-5 text-purple-600" />,
  },
  {
    title: "React Hooks",
    description: "Maîtrisez les hooks de React avec ce quiz complet.",
    tag: "Avancé",
    icon: <BookOpen className="h-5 w-5 text-purple-600" />,
  },
]

// Featured content for professors
const professorFeatured = [
  {
    title: "Créer des quiz engageants",
    description: "Conseils pour créer des quiz qui captiveront vos étudiants.",
    tag: "Guide",
    icon: <Brain className="h-5 w-5 text-purple-600" />,
  },
  {
    title: "Analyser les résultats",
    description: "Comment interpréter les données pour améliorer votre enseignement.",
    tag: "Tutoriel",
    icon: <Zap className="h-5 w-5 text-purple-600" />,
  },
  {
    title: "Modèles de quiz",
    description: "Utilisez nos modèles pour créer rapidement des quiz efficaces.",
    tag: "Ressource",
    icon: <BookOpen className="h-5 w-5 text-purple-600" />,
  },
]
