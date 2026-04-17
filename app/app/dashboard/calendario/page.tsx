import { auth } from '@/lib/auth'
import { CalendarioView, type AgendaConfig } from '@/components/calendario/calendario-view'

export default async function CalendarioPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null
  let agendaId: string | null = null
  let profissionais: { id: string; nome: string }[] = []
  let agendaConfig: AgendaConfig | null = null
  let currentUsuarioId: string | undefined
  let currentNome: string | undefined
  let currentTipoAcesso: string | undefined

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
        currentUsuarioId = usuario.id ?? undefined
        currentNome = usuario.nome ?? undefined
        currentTipoAcesso = usuario.tipoAcesso ?? undefined
      }
    } catch {
      // backend offline
    }
  }

  if (empresaId) {
    try {
      const [profRes, empRes] = await Promise.all([
        fetch(`${process.env.API_URL}/api/v1/usuarios/empresa/${empresaId}`, { cache: 'no-store' }),
        fetch(`${process.env.API_URL}/api/v1/empresas/${empresaId}`, { cache: 'no-store' }),
      ])
      if (profRes.ok) {
        const lista = await profRes.json()
        profissionais = lista.map((u: { id: string; nome: string }) => ({
          id: u.id,
          nome: u.nome,
        }))
      }
      if (empRes.ok) {
        const empresa = await empRes.json()
        agendaId = empresa.agendaId ?? null
      }
    } catch {
      // backend offline
    }
  }

  if (agendaId) {
    try {
      const res = await fetch(`${process.env.API_URL}/api/v1/agendas/${agendaId}`, { cache: 'no-store' })
      if (res.ok) {
        agendaConfig = await res.json()
      }
    } catch {
      // backend offline
    }
  }

  return <CalendarioView empresaId={empresaId} profissionais={profissionais} agendaConfig={agendaConfig} currentUsuarioId={currentUsuarioId} currentNome={currentNome} currentTipoAcesso={currentTipoAcesso} />
}

