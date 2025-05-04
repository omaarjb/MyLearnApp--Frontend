"use client"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Users,
  Brain,
  Zap,
  Target,
  ChevronDown,
  Star,
  Sparkles,
  ArrowUpRight,
  SunIcon,
  MoonIcon,
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  const { theme, setTheme } = useTheme()

  // Redirect to quiz page if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check the user's role from unsafeMetadata
      const userRole = user.unsafeMetadata?.role || ""
      
      if (userRole === "student") {
        router.push("/accueil")
      } else if (userRole === "professeur") {
        router.push("/accueil")
      } else {
        // Default redirect if role is not set or unknown
        router.push("/")
      }
    }
  }, [isLoaded, isSignedIn, router, user])

  const [activeSection, setActiveSection] = useState("hero")
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  // Show scroll indicator after a delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Track active section for potential navbar highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 },
    )

    if (heroRef.current) observer.observe(heroRef.current)
    if (featuresRef.current) observer.observe(featuresRef.current)
    if (ctaRef.current) observer.observe(ctaRef.current)

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current)
      if (featuresRef.current) observer.unobserve(featuresRef.current)
      if (ctaRef.current) observer.unobserve(ctaRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6 sticky top-0 z-50 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70"
      >
        <div className="flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-sm opacity-70"></div>
              <div className="relative rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-1">
                <div className="rounded-full bg-white p-1 dark:bg-gray-900">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                  ></motion.div>
                </div>
              </div>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              MyLearn
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Theme"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={() => router.push("/sign-in")}
                className="hover:bg-white/20 hover:text-purple-600 dark:hover:bg-gray-800/40"
              >
                Se connecter
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/sign-up")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 relative overflow-hidden group"
              >
                <span className="relative z-10">S'inscrire</span>
                <motion.div
                  className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-20 rounded-md"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section
        id="hero"
        ref={heroRef}
        className="w-full py-12 md:py-24 lg:py-20 relative flex items-center justify-center"
      >
        <motion.div
          style={{ opacity, scale }}
          className="absolute top-24 right-10 w-64 h-64 bg-purple-400/30 rounded-full filter blur-3xl"
        />
        <motion.div
          style={{ opacity, scale }}
          className="absolute bottom-10 left-10 w-72 h-72 bg-pink-400/20 rounded-full filter blur-3xl"
        />

        <div className="container px-4 md:px-6 relative">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center space-y-4 mx-auto max-w-lg"
            >
              <div className="inline-flex items-center space-x-1 rounded-full bg-gray-100/80 px-3 py-1 text-sm font-medium dark:bg-gray-800/60 mb-2 self-start">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="h-2 w-2 rounded-full bg-purple-600"
                />
                <span>Platform éducative interactive</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Apprenez, Testez,
                  </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600"
                  >
                    {" "}
                    Progressez
                  </motion.span>
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Plateforme interactive de quiz pour étudiants et professeurs. Créez, partagez et passez des quiz pour
                  améliorer vos connaissances.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4 self-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 relative overflow-hidden group h-12 px-6">
                    <span className="relative z-10">Commencer</span>
                    <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-20 rounded-md"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="h-12 border-2 relative overflow-hidden group dark:border-gray-700"
                  >
                    <span className="relative z-10">En savoir plus</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 rounded-md"
                      initial={{ y: "100%" }}
                      whileHover={{ y: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Category Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 gap-6 mx-auto w-full max-w-md lg:max-w-full"
            >
              {[
                { icon: <Brain className="h-8 w-8" />, title: "Programmation", color: "from-emerald-500 to-teal-600" },
                { icon: <Zap className="h-8 w-8" />, title: "Framework", color: "from-violet-500 to-purple-600" },
                { icon: <Target className="h-8 w-8" />, title: "Frontend", color: "from-rose-500 to-pink-600" },
                { icon: <BookOpen className="h-8 w-8" />, title: "Algorithmie", color: "from-blue-500 to-cyan-600" },
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm dark:bg-gray-800/60 p-6 shadow-lg group cursor-pointer flex flex-col items-center"
                >
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white mb-4 inline-block relative overflow-hidden`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.5, opacity: 0.2 }}
                      transition={{ duration: 0.5 }}
                    />
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-medium text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                    {category.title}
                  </h3>
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                    className="h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 mt-2"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
            >
              <p className="text-xs text-gray-500 mb-2 dark:text-gray-400">Découvrez plus</p>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
                <ChevronDown className="h-6 w-6 text-purple-600" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="absolute -top-40 right-0 left-0 h-40 bg-gradient-to-b from-transparent to-white dark:to-gray-950"
        />

        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <motion.div
              className="inline-block rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-3 py-1 text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                Fonctionnalités
              </span>
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl dark:text-white">
              Tout ce dont vous
              <span className="relative ml-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  avez besoin
                </span>
                <motion.svg
                  viewBox="0 0 100 15"
                  className="absolute -bottom-2 left-0 w-full h-3 overflow-visible stroke-purple-600"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <motion.path d="M 0 10 C 30 -10 70 25 100 10" />
                </motion.svg>
              </span>
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
              Notre plateforme offre des outils puissants pour l'apprentissage et l'enseignement.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 place-items-center">
            {[
              {
                icon: <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
                title: "Création de Quiz",
                description: "Les professeurs peuvent créer des quiz interactifs avec différents types de questions.",
                bgColor: "bg-purple-100 dark:bg-purple-900/30",
                color: "purple",
              },
              {
                icon: <CheckCircle className="h-6 w-6 text-pink-600 dark:text-pink-400" />,
                title: "Évaluation Automatique",
                description: "Les quiz sont évalués automatiquement avec des résultats détaillés.",
                bgColor: "bg-pink-100 dark:bg-pink-900/30",
                color: "pink",
              },
              {
                icon: <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                title: "Gestion des Utilisateurs",
                description: "Système de rôles pour étudiants et professeurs avec des permissions spécifiques.",
                bgColor: "bg-blue-100 dark:bg-blue-900/30",
                color: "blue",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm relative overflow-hidden group w-full dark:border-gray-800"
              >
                <motion.div
                  className={`absolute inset-0 ${feature.color === "purple" ? "bg-purple-600/10" : feature.color === "pink" ? "bg-pink-600/10" : "bg-blue-600/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className={`p-3 ${feature.bgColor} rounded-full relative z-10`}>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold relative z-10 text-center dark:text-white">{feature.title}</h3>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 relative z-10">
                  {feature.description}
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 relative z-10"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-${feature.color === "purple" ? "purple" : feature.color === "pink" ? "pink" : "blue"}-600 hover:text-${feature.color === "purple" ? "purple" : feature.color === "pink" ? "pink" : "blue"}-700`}
                  >
                    Découvrir <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900"
      >
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <div className="inline-block rounded-lg bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-sm text-purple-600 dark:text-purple-400 font-medium mb-4">
              <Star className="h-4 w-4 inline mr-1" />
              Témoignages
            </div>
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Ce qu'en disent nos utilisateurs</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "Cette plateforme a révolutionné ma façon d'enseigner. Mes élèves adorent les quiz interactifs!",
                author: "Marie L.",
                role: "Professeure de mathématiques",
                color: "purple",
              },
              {
                quote:
                  "J'ai amélioré mes compétences en programmation de façon significative grâce aux quiz quotidiens.",
                author: "Thomas M.",
                role: "Étudiant en informatique",
                color: "pink",
              },
              {
                quote:
                  "Interface intuitive et retours instantanés. C'est exactement ce dont j'avais besoin pour mon cours.",
                author: "Sophie D.",
                role: "Formatrice en entreprise",
                color: "blue",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative flex flex-col items-center text-center h-full"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div
                    className={`p-2 rounded-full ${testimonial.color === "purple" ? "bg-purple-100 text-purple-600" : testimonial.color === "pink" ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"} dark:bg-gray-700`}
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <p className="italic text-gray-600 dark:text-gray-300 mb-4">"{testimonial.quote}"</p>
                <div className="flex flex-col mt-auto">
                  <span className="font-bold dark:text-white">{testimonial.author}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={ctaRef}
        className="w-full py-12 md:py-24 lg:py-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-600/5 to-purple-600/5 rounded-full"
        />

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl dark:text-white">
                Prêt à commencer votre
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 ml-2">
                  parcours d'apprentissage
                </span>
                ?
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400 mx-auto">
                Rejoignez notre communauté d'apprenants et d'enseignants dès aujourd'hui.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-6 relative overflow-hidden group" onClick={() => router.push("/sign-up")}>
                  <span className="relative z-10">S'inscrire gratuitement</span>
                  <motion.div
                    className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-20 rounded-md"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="h-12 border-2 relative overflow-hidden group dark:border-gray-700" onClick={() => router.push("/sign-in")}>
                  <span className="relative z-10">Se connecter</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 rounded-md"
                    initial={{ y: "100%" }}
                    whileHover={{ y: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full py-6 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="container flex flex-col md:flex-row justify-between items-center px-4 md:px-6 mx-auto">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-1">
              <div className="rounded-full bg-white p-1 dark:bg-gray-900">
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
              </div>
            </div>
            <span className="text-sm font-medium dark:text-gray-400">© 2025 MyLearn. Tous droits réservés.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors dark:text-gray-400">
              Conditions
            </a>
            <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors dark:text-gray-400">
              Confidentialité
            </a>
            <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors dark:text-gray-400">
              Contact
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

