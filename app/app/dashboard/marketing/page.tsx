import { auth } from '@/lib/auth'
import { MarketingView } from '@/components/marketing/marketing-view'

export default async function MarketingPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let empresaId: string | null = null
  let profissionais: unknown[] = []

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
          const profRes = await fetch(
            `${process.env.API_URL}/api/v1/usuarios/empresa/${empresaId}`,
            { cache: 'no-store' }
          )
          if (profRes.ok) profissionais = await profRes.json()
        }
      }
    } catch {
      // backend offline — carrega vazio
    }
  }

  return <MarketingView empresaId={empresaId} profissionais={profissionais as never} />
}
