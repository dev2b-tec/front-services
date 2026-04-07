import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { ChatView } from '@/components/chat/chat-view'

const WHATS_URL = process.env.WHATS_API_URL ?? 'http://app-integration-watts:8012'

export default async function ChatPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null
  let initialConversas: unknown[] = []

  if (keycloakId) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/api/v1/usuarios/sync`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: session?.user?.name ?? '',
            email: session?.user?.email ?? '',
            keycloakId,
          }),
          cache: 'no-store',
        }
      )
      if (res.ok) {
        const usuario = await res.json()
        empresaId = usuario.empresaId ?? null

        if (empresaId) {
          const cRes = await fetch(
            `${WHATS_URL}/api/v1/conversas/empresa/${empresaId}?size=100&sort=createdAt,desc`,
            { cache: 'no-store' }
          )
          if (cRes.ok) {
            const data = await cRes.json()
            initialConversas = Array.isArray(data) ? data : (data.content ?? [])
          }
        }
      }
    } catch {
      // backend offline
    }
  }

  return (
    <Suspense>
      <ChatView empresaId={empresaId} initialConversas={initialConversas} />
    </Suspense>
  )
}
