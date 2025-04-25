"use client"

import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { User, Mail, Calendar, MapPin, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function ProfilePage() {
  const { user } = useUser()

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"
    return ((user?.firstName || "").charAt(0) + (user?.lastName || "").charAt(0)).toUpperCase() || "U"
  }

  // Get user role with capitalized first letter
  const getUserRole = () => {
    const role = user?.unsafeMetadata?.role || "user"
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm dark:bg-gray-800/60">
              <div className="h-32 md:h-48 bg-gradient-to-r from-purple-600 to-pink-600 relative"></div>
              <div className="px-6 pb-6 relative">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12 md:-mt-16">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-gray-800 ring-4 ring-purple-500/20">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                    <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold">{user?.fullName || "Utilisateur"}</h1>
                    <p className="text-muted-foreground">
                      Membre depuis {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                    {/* Display role badge */}
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {getUserRole()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* User Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nom Complet</p>
                      <p className="font-medium">{user?.fullName || "Utilisateur"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.emailAddresses[0]?.emailAddress || "email@example.com"}</p>
                    </div>
                  </div>
                  {/* Add role information */}
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rôle</p>
                      <p className="font-medium">{getUserRole()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date d'inscription</p>
                      <p className="font-medium">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Localisation</p>
                      <p className="font-medium">Maroc</p>
                    </div>
                  </div>
                  <Separator />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

