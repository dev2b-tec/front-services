import { notFound } from 'next/navigation'
import EmpresaAgendamentoView from '@/components/sites/empresa-agendamento-view'

const API = process.env.API_URL

export default async function EmpresaSitePage({
  params,
}: {
  params: Promise<{ empresaId: string }>
}) {
  const { empresaId } = await params

  const empRes = await fetch(`${API}/api/v1/empresas/${empresaId}`, { cache: 'no-store' })
  if (!empRes.ok) notFound()
  const empresa = await empRes.json()

  let profissionais: unknown[] = []
  try {
    const profRes = await fetch(`${API}/api/v1/usuarios/empresa/${empresaId}`, { cache: 'no-store' })
    if (profRes.ok) profissionais = await profRes.json()
  } catch {
    // backend indisponível
  }

  return <EmpresaAgendamentoView empresa={empresa} profissionais={profissionais} />
}
