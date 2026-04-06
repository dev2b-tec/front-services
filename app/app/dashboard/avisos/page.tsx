import { auth } from '@/lib/auth'
import { AvisosView } from '@/components/avisos/avisos-view'

export default async function AvisosPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null

  if (keycloakId) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/api/v1/usuarios/keycloak/${keycloakId}`,
        { cache: 'no-store' }
      )
      if (res.ok) {
        const usuario = await res.json()
        empresaId = usuario.empresaId ?? null
      }
    } catch {
      // backend offline
    }
  }

  return <AvisosView empresaId={empresaId} />
}
