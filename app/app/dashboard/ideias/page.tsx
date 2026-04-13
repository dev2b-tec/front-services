import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { CanalIdeias } from '@/components/ideias/canal-ideias'

export default async function IdeiaPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId = ''

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
        empresaId = usuario.empresaId ?? ''
      }
    } catch {
      // backend offline
    }
  }

  return (
    <Suspense>
      <CanalIdeias empresaId={empresaId} />
    </Suspense>
  )
}
