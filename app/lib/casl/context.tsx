'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { createMongoAbility } from '@casl/ability'
import { useSession } from 'next-auth/react'
import { buildAbility } from './ability'
import type { AppAbility } from './types'

// ─── Context types ────────────────────────────────────────────────────────────

type AbilityMeta = {
  loading: boolean
  perfilNome: string | null
  ownId: string | undefined
}

// Separamos em dois contextos:
// AbilityCtx  → apenas o Ability (necessário para o Can component)
// AbilityMetaCtx → loading + metadados

const defaultAbility: AppAbility = createMongoAbility([])

export const AbilityCtx = createContext<AppAbility>(defaultAbility)

export const AbilityMetaCtx = createContext<AbilityMeta>({
  loading: true,
  perfilNome: null,
  ownId: undefined,
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AbilityProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [ability, setAbility] = useState<AppAbility>(defaultAbility)
  const [meta, setMeta] = useState<AbilityMeta>({
    loading: true,
    perfilNome: null,
    ownId: undefined,
  })

  useEffect(() => {
    if (!session?.keycloakId) {
      setMeta((m) => ({ ...m, loading: false }))
      return
    }

    setMeta((m) => ({ ...m, loading: true }))

    fetch(`/api/v1/usuarios/keycloak/${session.keycloakId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((user: { id?: string; perfilNome?: string; permissoes?: string[] } | null) => {
        if (!user) return
        const built = buildAbility(user.permissoes ?? [], user.perfilNome ?? null, user.id)
        setAbility(built)
        setMeta({ loading: false, perfilNome: user.perfilNome ?? null, ownId: user.id })
      })
      .catch(() => setMeta((m) => ({ ...m, loading: false })))
  }, [session?.keycloakId])

  return (
    <AbilityCtx.Provider value={ability}>
      <AbilityMetaCtx.Provider value={meta}>
        {children}
      </AbilityMetaCtx.Provider>
    </AbilityCtx.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook principal para usar o CASL no frontend.
 *
 * @example
 * const { ability, loading, perfilNome, ownId } = useAbility()
 * ability.can('create', 'usuarios')
 * ability.can('read', subject('pacientes', paciente))
 */
export function useAbility() {
  const ability = useContext(AbilityCtx)
  const meta = useContext(AbilityMetaCtx)
  return { ability, ...meta }
}
