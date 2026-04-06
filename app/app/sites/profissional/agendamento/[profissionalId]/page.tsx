import { notFound } from 'next/navigation'
import ProfissionalAgendamentoView from '@/components/sites/profissional-agendamento-view'

const API = process.env.API_URL

export default async function ProfissionalAgendamentoPage({
  params,
}: {
  params: Promise<{ profissionalId: string }>
}) {
  const { profissionalId } = await params

  const userRes = await fetch(`${API}/api/v1/usuarios/${profissionalId}`, { cache: 'no-store' })
  if (!userRes.ok) notFound()
  const usuario = await userRes.json()

  // Fetch a fresh presigned URL server-side so the browser gets the public s3 URL.
  if (usuario.fotoUrl) {
    try {
      const fotoRes = await fetch(`${API}/api/v1/usuarios/${profissionalId}/foto-url`, { cache: 'no-store' })
      if (fotoRes.ok) {
        const { fotoUrl } = await fotoRes.json()
        usuario.fotoUrl = fotoUrl
      }
    } catch { /* non-critical */ }
  }

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
