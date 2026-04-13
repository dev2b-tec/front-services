import { auth } from '@/lib/auth'
import { UsuariosView } from '@/components/usuarios/usuarios-view'

export default async function UsuariosPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null

  if (keycloakId) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/api/v1/usuarios/sync`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: session?.user?.name ?? '', email: session?.user?.email ?? '', keycloakId }),
          cache: 'no-store',
        }
      )
      if (res.ok) {
        const usuario = await res.json()
        empresaId = usuario.empresaId ?? null
      }
    } catch {
      // backend offline
    }
  }

  return <UsuariosView empresaId={empresaId} />
}
