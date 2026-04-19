import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { ClientesView, type PacienteApi, type ProfissionalItem } from '@/components/clientes/clientes-view'

export default async function ClientesPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null
  let pacientes: PacienteApi[] = []
  let profissionais: ProfissionalItem[] = []
  let usuarioId: string | undefined
  let usuarioNome: string | undefined

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
        usuarioId = usuario.id ?? undefined
        usuarioNome = usuario.nome ?? undefined
        const isSimples = usuario.perfilNome === 'PROFISSIONAL_SIMPLES'
        if (empresaId) {
          const pacientesUrl = isSimples && usuarioId
            ? `${process.env.API_URL}/api/v1/pacientes/empresa/${empresaId}?usuarioId=${usuarioId}`
            : `${process.env.API_URL}/api/v1/pacientes/empresa/${empresaId}`
          const [pRes, uRes] = await Promise.all([
            fetch(pacientesUrl, { cache: 'no-store' }),
            fetch(`${process.env.API_URL}/api/v1/usuarios/empresa/${empresaId}`, { cache: 'no-store' }),
          ])
          if (pRes.ok) pacientes = await pRes.json()
          if (uRes.ok) {
            const lista = await uRes.json()
            profissionais = lista.map((u: { id: string; nome: string }) => ({ id: u.id, nome: u.nome }))
          }
        }
      }
    } catch {
      // backend offline — tela carrega vazia
    }
  }

  return (
    <Suspense>
      <ClientesView initialPacientes={pacientes} empresaId={empresaId} profissionais={profissionais} usuarioId={usuarioId} usuarioNome={usuarioNome} />
    </Suspense>
  )
}
