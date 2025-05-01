"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoonIcon, SunIcon, Menu, X, User, LogOut, PlusCircle, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export default function Navbar() {
  const { setTheme, theme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { signOut } = useClerk()
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    // Get user role when component mounts or user changes
    if (isLoaded && user) {
      const role = user.unsafeMetadata?.role || "user"
      setUserRole(role)
    }
  }, [isLoaded, user])

  // Check if user is a student
  const isStudent = userRole === "student"

  // Determine home route based on user role
  const homeRoute = "/accueil"

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"
    return ((user.firstName || "").charAt(0) + (user.lastName || "").charAt(0)).toUpperCase() || "U"
  }

  // Function to check if a link is active
  const isActive = (path) => {
    if (path === homeRoute && pathname === homeRoute) {
      return true
    }
    // For other paths, check if the pathname starts with the path
    // This handles nested routes like /create-quiz/new
    return path !== homeRoute && pathname.startsWith(path)
  }

  // NavLink component for consistent styling
  const NavLink = ({ href, children }) => {
    const active = isActive(href)

    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors hover:text-primary relative group ${
          active ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
        }`}
      >
        {children}
        <span
          className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all ${
            active ? "w-full" : "w-0 group-hover:w-full"
          }`}
        ></span>
      </Link>
    )
  }

  // Mobile NavLink component
  const MobileNavLink = ({ href, children }) => {
    const active = isActive(href)

    return (
      <Link
        href={href}
        className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-accent ${
          active ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20" : "text-muted-foreground"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        {children}
      </Link>
    )
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${
        scrolled ? "bg-white/80 dark:bg-gray-900/80 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href={homeRoute} className="mx-5 flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-sm opacity-70"></div>
              <div className="relative rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-1">
                <div className="rounded-full bg-white p-1 dark:bg-gray-900">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                </div>
              </div>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              MyLearn
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden md:flex items-center gap-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <NavLink href={homeRoute}>Accueil</NavLink>

          {isLoaded && userRole && !isStudent && <NavLink href="/quizzes">Mes Quiz</NavLink>}

          {isLoaded && userRole && isStudent && <NavLink href="/quiz">Quiz</NavLink>}

          {isLoaded && userRole && !isStudent && <NavLink href="/create-quiz">Créer un Quiz</NavLink>}

          {isLoaded && userRole && isStudent && <NavLink href="/stats">Statistiques</NavLink>}
        </motion.nav>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                <Avatar className="h-8 w-8 ring-2 ring-purple-500/20">
                  <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.fullName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>

              {/* Only show "Nouveau Quiz" if user is NOT a student */}
              {!isStudent && (
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/create-quiz")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Nouveau Quiz</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
                onClick={() => router.push("/signout")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-1 px-4 pb-3 pt-2">
            <MobileNavLink href={homeRoute}>Accueil</MobileNavLink>

            {isLoaded && userRole && !isStudent && <MobileNavLink href="/quizzes">Mes Quiz</MobileNavLink>}

            {isLoaded && userRole && isStudent && <MobileNavLink href="/quiz">Quiz</MobileNavLink>}

            {/* Only show "Créer un Quiz" if user is NOT a student */}
            {isLoaded && userRole && !isStudent && <MobileNavLink href="/create-quiz">Créer un Quiz</MobileNavLink>}

            {isLoaded && userRole && isStudent && <MobileNavLink href="/stats">Statistiques</MobileNavLink>}

            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un quiz..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
              />
            </div>
            <Button className="w-full mt-3 text-red-500" variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  )
}
