'use client'

import { useAbility } from '@/lib/casl'
import type { AppAction, AppSubject } from '@/lib/casl'

/**
 * Hook legado mantido por compatibilidade.
 * Internamente delega ao AbilityProvider (CASL).
 *
 * Prefira usar `useAbility()` diretamente para novas funcionalidades.
 */
export function usePermissoes() {
  const { ability, loading, perfilNome } = useAbility()

  /** Aceita formato "subject.action" — ex: "pacientes.read" */
  const can = (permissao: string): boolean => {
    const dot = permissao.indexOf('.')
    if (dot === -1) return false
    const sub = permissao.slice(0, dot) as AppSubject
    const action = permissao.slice(dot + 1) as AppAction
    return ability.can(action, sub)
  }

  const canAny = (...perms: string[]): boolean => perms.some(can)
  const canAll = (...perms: string[]): boolean => perms.every(can)

  return { perfilNome, loading, can, canAny, canAll }
}
