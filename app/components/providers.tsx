"use client"

import { SessionProvider } from "next-auth/react"
import { AbilityProvider } from "@/lib/casl"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AbilityProvider>
        {children}
        <Toaster />
      </AbilityProvider>
    </SessionProvider>
  )
}
