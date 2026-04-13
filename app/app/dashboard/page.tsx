import { auth } from '@/lib/auth'
import { DashboardView, type DashboardData } from '@/components/dashboard/dashboard-view'

const EMPTY: DashboardData = {
  agendamentosHoje: [],
  totalRecebido: 0,
  totalAReceber: 0,
  evolucoesCriadas: 0,
  sessoesAtendidas: 0,
  sessoesDesmarcadas: 0,
  faltas: 0,
  chartFinanceiro: [],
  chartSessoes: [],
  chartAgendamentos: [],
  pacientesGenero: {},
  pacientesGrupo: {},
  pacientesStatus: {},
  pacientesComoConheceu: {},
}

export default async function DashboardPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let data: DashboardData = EMPTY
  let empresaId: string | null = null

  if (keycloakId) {
    try {
      const userRes = await fetch(
        `${process.env.API_URL}/api/v1/usuarios/sync`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: session?.user?.name ?? '', email: session?.user?.email ?? '', keycloakId }),
          cache: 'no-store',
        }
      )
      if (userRes.ok) {
        const usuario = await userRes.json()
        empresaId = usuario.empresaId ?? null
        if (empresaId) {
          const dashRes = await fetch(
            `${process.env.API_URL}/api/v1/dashboard/empresa/${empresaId}`,
            { cache: 'no-store' }
          )
          if (dashRes.ok) {
            data = await dashRes.json()
          }
        }
      }
    } catch {
      // backend offline — show empty state
    }
  }

  return <DashboardView data={data} empresaId={empresaId} />
}