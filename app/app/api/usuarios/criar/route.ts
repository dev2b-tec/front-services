import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

interface CriarUsuarioPayload {
  nome: string
  email: string
  senha: string
  telefone?: string
  tipo?: string
  especialidade?: string
  conselho?: string
  numeroConselho?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  nivelPermissao?: string
  genero?: string
  permissoes?: {
    financeiro?: boolean
    calendario?: boolean
    horarios?: boolean
    todosPacientes?: boolean
    evolucoes?: boolean
    filaEspera?: boolean
  }
}

async function getKeycloakAdminToken(): Promise<string> {
  // Uses a service account (client_credentials) scoped to the app realm.
  // The client needs realm-management roles: manage-users, create-user, view-users.
  const issuer = process.env.KEYCLOAK_ISSUER ?? ''

  const res = await fetch(
    `${issuer}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.KEYCLOAK_CLIENT_ID ?? '',
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
      }),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Keycloak admin token failed: ${text}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.keycloakId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const payload: CriarUsuarioPayload = await request.json()

    if (!payload.email || !payload.nome || !payload.senha) {
      return NextResponse.json(
        { error: 'email, nome e senha são obrigatórios' },
        { status: 400 },
      )
    }

    // 1 — Resolve empresaId from logged-in session
    const meRes = await fetch(
      `${process.env.API_URL}/api/v1/usuarios/keycloak/${session.keycloakId}`,
      { cache: 'no-store' },
    )
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 500 })
    }
    const me = await meRes.json()
    const empresaId: string | undefined = me.empresaId

    // 2 — Create user in Keycloak
    const issuer = process.env.KEYCLOAK_ISSUER ?? ''
    const baseUrl = issuer.replace(/\/realms\/[^/]+\/?$/, '')
    const realm = issuer.match(/\/realms\/([^/]+)/)?.[1] ?? 'master'

    const adminToken = await getKeycloakAdminToken()

    // Macro roles only — fine-grained profile is stored in our own DB (perfis table).
    // GERENTE_GERAL and GERENTE get tenant_admin; everyone else gets system_user.
    const macroRole =
      payload.nivelPermissao === 'Gerente Geral' || payload.nivelPermissao === 'Gerente'
        ? 'tenant_admin'
        : 'system_user'

    const kcRes = await fetch(
      `${baseUrl}/admin/realms/${realm}/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          username: payload.email,
          email: payload.email,
          firstName: payload.nome.split(' ')[0] ?? payload.nome,
          lastName: payload.nome.split(' ').slice(1).join(' ') || undefined,
          enabled: true,
          emailVerified: true,
          credentials: [
            {
              type: 'password',
              value: payload.senha,
              temporary: false,
            },
          ],
        }),
      },
    )

    if (!kcRes.ok) {
      if (kcRes.status === 409) {
        return NextResponse.json({ error: 'E-mail já cadastrado no sistema de autenticação' }, { status: 409 })
      }
      const text = await kcRes.text()
      return NextResponse.json({ error: `Erro ao criar usuário: ${text}` }, { status: 500 })
    }

    // 3 — Extract keycloakId from Location header
    const location = kcRes.headers.get('location') ?? ''
    const keycloakId = location.split('/').pop()

    if (!keycloakId) {
      return NextResponse.json({ error: 'Keycloak não retornou o ID do usuário' }, { status: 500 })
    }

    // 4 — Assign macro realm role (best-effort — role must exist in Keycloak)
    try {
      const rolesRes = await fetch(
        `${baseUrl}/admin/realms/${realm}/roles/${macroRole}`,
        { headers: { Authorization: `Bearer ${adminToken}` } },
      )
      if (rolesRes.ok) {
        const role = await rolesRes.json()
        await fetch(
          `${baseUrl}/admin/realms/${realm}/users/${keycloakId}/role-mappings/realm`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify([role]),
          },
        )
      }
    } catch {
      // Role assignment is best-effort — don't fail the whole request
    }

    // 5 — Create user in our backend
    const backendRes = await fetch(`${process.env.API_URL}/api/v1/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: payload.nome,
        email: payload.email,
        keycloakId,
        telefone: payload.telefone,
        tipo: payload.tipo,
        especialidade: payload.especialidade,
        conselho: payload.conselho,
        numeroConselho: payload.numeroConselho,
        cep: payload.cep,
        logradouro: payload.logradouro,
        numero: payload.numero,
        complemento: payload.complemento,
        bairro: payload.bairro,
        cidade: payload.cidade,
        empresaId,
        genero: payload.genero,
        tipoAcesso: payload.nivelPermissao,
        permissoes: payload.permissoes,
      }),
    })

    if (!backendRes.ok) {
      // Rollback Keycloak user on backend failure
      try {
        await fetch(`${baseUrl}/admin/realms/${realm}/users/${keycloakId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      } catch {
        // ignore rollback errors
      }

      if (backendRes.status === 400) {
        const err = await backendRes.json().catch(() => ({}))
        return NextResponse.json(
          { error: (err as { message?: string }).message ?? 'E-mail já cadastrado' },
          { status: 409 },
        )
      }
      return NextResponse.json({ error: 'Erro ao salvar usuário no sistema' }, { status: 500 })
    }

    const usuario = await backendRes.json()
    return NextResponse.json(usuario, { status: 201 })
  } catch (err) {
    console.error('[POST /api/usuarios/criar]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
