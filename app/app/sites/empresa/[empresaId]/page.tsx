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

  // Buscar presigned URL fresca para cada profissional que tenha foto
  profissionais = await Promise.all(
    (profissionais as Array<Record<string, unknown>>).map(async (prof) => {
      if (!prof.fotoUrl) return prof
      try {
        const fotoRes = await fetch(`${API}/api/v1/usuarios/${prof.id}/foto-url`, { cache: 'no-store' })
        if (fotoRes.ok) {
          const { fotoUrl } = await fotoRes.json()
          return { ...prof, fotoUrl }
        }
      } catch { /* non-critical */ }
      return prof
    })
  )

  return <EmpresaAgendamentoView empresa={empresa} profissionais={profissionais} />
}
