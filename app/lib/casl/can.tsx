'use client'

import { createContextualCan } from '@casl/react'
import { AbilityCtx } from './context'

/**
 * Componente declarativo para controle de acesso com CASL.
 *
 * @example
 * // Simples
 * <Can I="create" a="usuarios">
 *   <button>Novo Usuário</button>
 * </Can>
 *
 * // Com objeto (condições de linha)
 * import { subject } from '@/lib/casl'
 * <Can I="read" this={subject('pacientes', paciente)}>
 *   <PacienteCard />
 * </Can>
 *
 * // Condicional de campo
 * <Can I="update" a="usuarios" field="tipoAcesso">
 *   <NivelPermissaoSelect />
 * </Can>
 */
export const Can = createContextualCan(AbilityCtx.Consumer)
