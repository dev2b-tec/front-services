import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { ClientesView, type PacienteApi } from '@/components/clientes/clientes-view'

export default async function ClientesPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null
  let pacientes: PacienteApi[] = []

  if (keycloakId) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/api/v1/usuarios/keycloak/${keycloakId}`,
        { cache: 'no-store' }
      )
      if (res.ok) {
        const usuario = await res.json()
        empresaId = usuario.empresaId ?? null
        if (empresaId) {
          const pRes = await fetch(
            `${process.env.API_URL}/api/v1/pacientes/empresa/${empresaId}`,
            { cache: 'no-store' }
          )
          if (pRes.ok) pacientes = await pRes.json()
        }
      }
    } catch {
      // backend offline — tela carrega vazia
    }
  }

  return (
    <Suspense>
      <ClientesView initialPacientes={pacientes} empresaId={empresaId} />
    </Suspense>
  )
}
