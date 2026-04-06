import { auth } from '@/lib/auth'
import { ConfiguracoesView } from '@/components/configuracoes/configuracoes-view'

export interface UsuarioData {
  id: string
  nome: string
  email: string
  keycloakId: string
  fotoUrl?: string
  assinaturaUrl?: string
  telefone?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  tipo?: string
  conselho?: string
  numeroConselho?: string
  especialidade?: string
  empresaId?: string
  agendaId?: string
}

export interface EmpresaData {
  id: string
  nomeComercial: string
  logoUrl?: string
  telefoneComercial?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  duracaoSessaoMinutos?: number
  agendaId?: string
}

export default async function ConfiguracoesPage() {
  const session = await auth()
  const keycloakId = session?.keycloakId

  let usuario: UsuarioData | null = null
  let empresa: EmpresaData | null = null

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
        usuario = await res.json()
        if (usuario?.empresaId) {
          const empRes = await fetch(
            `${process.env.API_URL}/api/v1/empresas/${usuario.empresaId}`,
            { cache: 'no-store' }
          )
          if (empRes.ok) empresa = await empRes.json()
        }
      }
    } catch {
      // backend offline — tela carrega vazia
    }
  }

  return <ConfiguracoesView initialUsuario={usuario} initialEmpresa={empresa} />
}
