'use client'

import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignInRedirect() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  useEffect(() => {
    signIn('keycloak', { callbackUrl })
  }, [callbackUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--d2b-bg-main)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#7C4DFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--d2b-text-secondary)]">Redirecionando para autenticação...</p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInRedirect />
    </Suspense>
  )
}
