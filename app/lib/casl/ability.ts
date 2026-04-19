import { createMongoAbility, AbilityBuilder, subject } from '@casl/ability'
import type { AppAbility, AppAction, AppSubject } from './types'

export { subject }

/**
 * Subjects cujo acesso para PROFISSIONAL_SIMPLES usa condição de linha.
 * Chave = subject, Valor = nome do campo no objeto que deve bater com ownId.
 *
 * pacientes foi removido intencionalmente: a filtragem é feita no backend
 * (GET /pacientes/empresa/{id}?usuarioId=) que retorna apenas os pacientes
 * do próprio profissional ou compartilhados. O CASL não precisa replicar
 * essa lógica e acabaria bloqueando pacientes compartilhados (pois o campo
 * usuarioId deles pertence a quem os criou, não ao profissional com acesso).
 */
const ROW_CONDITION_FIELDS: Partial<Record<AppSubject, string>> = {}

/**
 * Perfis que têm controle total sobre usuários, incluindo alterar o
 * campo "Nível de Permissão" (tipoAcesso) de outros usuários.
 */
const ADMIN_PERFIS = new Set(['GERENTE', 'GERENTE_GERAL'])

/**
 * Campos de usuário que qualquer perfil com usuarios.update pode editar,
 * exceto tipoAcesso — reservado a GERENTE / GERENTE_GERAL.
 */
const CAMPOS_USUARIO_SEM_NIVEL = [
  'nome', 'telefone', 'genero', 'cep', 'logradouro',
  'numero', 'complemento', 'bairro', 'cidade',
  'duracaoSessao', 'tipo', 'especialidade', 'conselho', 'numeroConselho',
]

// AbilityBuilder<AppAbility> infere MongoQuery<never> para subjects do tipo
// string literal pois não conhece a forma dos objetos. Usamos `as Cond` para
// contornar essa limitação de tipagem sem afetar o comportamento em runtime.
type Cond = Parameters<InstanceType<typeof AbilityBuilder<AppAbility>>['can']>[2]

/**
 * Constrói um AppAbility a partir da lista de permissões retornada pelo backend
 * (formato "subject.action", ex: "pacientes.read").
 *
 * Regras de campo:
 *   – Somente GERENTE / GERENTE_GERAL podem atualizar `tipoAcesso` em qualquer usuário.
 *   – PROFISSIONAL_SIMPLES tem acesso limitado ao próprio registro (row-level).
 */
export function buildAbility(
  permissoes: string[],
  perfilNome: string | null,
  ownId?: string,
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  const isSimples = perfilNome === 'PROFISSIONAL_SIMPLES'
  const isAdmin   = perfilNome ? ADMIN_PERFIS.has(perfilNome) : false

  for (const perm of permissoes) {
    const dot = perm.indexOf('.')
    if (dot === -1) continue
    const sub    = perm.slice(0, dot) as AppSubject
    const action = perm.slice(dot + 1) as AppAction

    if (isSimples && ownId && sub in ROW_CONDITION_FIELDS) {
      // Profissional Simples: row-level em pacientes
      const field = ROW_CONDITION_FIELDS[sub]!
      can(action, sub, { [field]: ownId } as Cond)
    } else if (!isAdmin && action === 'update' && sub === 'usuarios') {
      // Perfis não-admin com usuarios.update: podem editar dados pessoais/profissionais,
      // mas NÃO podem alterar o campo tipoAcesso (nível de permissão).
      can('update', 'usuarios', CAMPOS_USUARIO_SEM_NIVEL)
    } else {
      can(action, sub)
    }
  }

  // Profissional Simples: pode ver e editar apenas o próprio cadastro
  if (isSimples && ownId) {
    can('read',   'usuarios', { id: ownId } as Cond)
    can('update', 'usuarios', CAMPOS_USUARIO_SEM_NIVEL, { id: ownId } as Cond)
  }

  return build()
}
