import { notFound } from 'next/navigation'
import ProfissionalAgendamentoView from '@/components/sites/profissional-agendamento-view'

const API = process.env.API_URL

export default async function ProfissionalSitePage({
  params,
}: {
  params: Promise<{ usuarioId: string }>
}) {
  const { usuarioId } = await params

  const userRes = await fetch(`${API}/api/v1/usuarios/${usuarioId}`, { cache: 'no-store' })
  if (!userRes.ok) notFound()
  const usuario = await userRes.json()

  let empresa = null
  if (usuario.empresaId) {
    try {
      const empRes = await fetch(`${API}/api/v1/empresas/${usuario.empresaId}`, { cache: 'no-store' })
      if (empRes.ok) empresa = await empRes.json()
    } catch {
      // backend indisponível
    }
  }

  return <ProfissionalAgendamentoView usuario={usuario} empresa={empresa} />
}
