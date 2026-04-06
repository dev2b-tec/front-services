import { auth } from '@/lib/auth'
import { CalendarioView } from '@/components/calendario/calendario-view'

export default async function CalendarioPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null
  let profissionais: { id: string; nome: string }[] = []

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

  if (empresaId) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/api/v1/usuarios/empresa/${empresaId}`,
        { cache: 'no-store' }
      )
      if (res.ok) {
        const lista = await res.json()
        profissionais = lista.map((u: { id: string; nome: string }) => ({
          id: u.id,
          nome: u.nome,
        }))
      }
    } catch {
      // backend offline
    }
  }

  return <CalendarioView empresaId={empresaId} profissionais={profissionais} />
}

