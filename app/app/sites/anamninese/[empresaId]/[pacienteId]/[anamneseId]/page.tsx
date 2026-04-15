import { notFound } from 'next/navigation'
import AnamnesePublicaView from '@/components/sites/anamnese-publica-view'

const API = process.env.API_URL

export default async function AnamnesePublicaPage({
  params,
}: {
  params: Promise<{ empresaId: string; pacienteId: string; anamneseId: string }>
}) {
  const { empresaId, pacienteId, anamneseId } = await params

  // Carregar modelo da anamnese
  const anamneseRes = await fetch(`${API}/api/v1/anamneses/${anamneseId}`, { cache: 'no-store' })
  if (!anamneseRes.ok) notFound()
  const anamnese = await anamneseRes.json()

  // Verificar se já foi respondida (se sim, 204 ou 404 = não respondida ainda)
  const respostaRes = await fetch(
    `${API}/api/v1/respostas-anamnese/paciente/${pacienteId}/anamnese/${anamneseId}`,
    { cache: 'no-store' }
  )
  const jaRespondida = respostaRes.ok && respostaRes.status !== 204

  // Carregar nome do paciente para exibir
  let pacienteNome = ''
  try {
    const pacRes = await fetch(`${API}/api/v1/pacientes/${pacienteId}`, { cache: 'no-store' })
    if (pacRes.ok) {
      const paciente = await pacRes.json()
      pacienteNome = paciente.nome ?? ''
    }
  } catch { /* non-critical */ }

  // Carregar logo da empresa
  let empresaLogo: string | null = null
  let empresaNome = ''
  try {
    const empRes = await fetch(`${API}/api/v1/empresas/${empresaId}`, { cache: 'no-store' })
    if (empRes.ok) {
      const empresa = await empRes.json()
      empresaNome = empresa.nomeComercial ?? ''
      empresaLogo = empresa.logoUrl ?? null
    }
  } catch { /* non-critical */ }

  return (
    <AnamnesePublicaView
      anamnese={anamnese}
      pacienteId={pacienteId}
      pacienteNome={pacienteNome}
      empresaNome={empresaNome}
      empresaLogo={empresaLogo}
      jaRespondida={jaRespondida}
    />
  )
}
