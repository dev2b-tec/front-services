import type { MongoAbility, MongoQuery } from '@casl/ability'

// ─── Actions ─────────────────────────────────────────────────────────────────
export type AppAction = 'read' | 'create' | 'update' | 'delete' | 'manage'

// ─── Subjects – mirrors the permission prefix used in the DB ─────────────────
export type AppSubject =
  | 'pacientes'
  | 'agenda'
  | 'financeiro'
  | 'usuarios'
  | 'evolucoes'
  | 'documentos'
  | 'configuracoes'
  | 'relatorios'
  | 'empresa'
  | 'all'

// ─── Ability type ─────────────────────────────────────────────────────────────
// MongoQuery sem parâmetro = MongoQuery<Record<PropertyKey, unknown>> (permissivo),
// necessário para que conditions como { id: ... } e { usuarioId: ... } sejam aceitos
// com subjects do tipo string literal.
export type AppAbility = MongoAbility<[AppAction, AppSubject], MongoQuery>
