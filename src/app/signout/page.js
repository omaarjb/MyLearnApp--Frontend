// pages/signout.js
"use client"

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut();
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect after a brief delay
        setTimeout(() => router.push("/"), 500);
      } catch (error) {
        console.error("Error during sign out:", error);
        router.push("/");
      }
    };

    performSignOut();
  }, [signOut, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Déconnexion en cours...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    </div>
  );
}