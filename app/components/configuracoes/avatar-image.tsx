'use client'

import { useState, useEffect } from 'react'
import { User } from 'lucide-react'

interface AvatarImageProps {
  userId?: string
  fotoUrl?: string
  size?: number
  fallbackIcon?: React.ReactNode
}

export function AvatarImage({ userId, fotoUrl, size = 112, fallbackIcon }: AvatarImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!fotoUrl || !userId) {
      setLoading(false)
      return
    }

    async function fetchFotoUrl() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${userId}/foto-url`)
        if (res.ok) {
          const data = await res.json()
          setImageUrl(data.fotoUrl)
          setError(false)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFotoUrl()
  }, [userId, fotoUrl])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#7C4DFF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !imageUrl) {
    return fallbackIcon || <User size={52} className="text-[var(--d2b-text-muted)]" strokeWidth={1} />
  }

  return (
    <img
      src={imageUrl}
      alt="Foto"
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  )
}
