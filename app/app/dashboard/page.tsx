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

  if (keycloakId) {
    try {
      const userRes = await fetch(
        `${process.env.API_URL}/api/v1/usuarios/keycloak/${keycloakId}`,
        { cache: 'no-store' }
      )
      if (userRes.ok) {
        const usuario = await userRes.json()
        const empresaId: string | null = usuario.empresaId ?? null
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

  return <DashboardView data={data} />
}