'use client'

/**
 * components/shell/em-construcao.tsx
 *
 * Componente genérico de "Em construção" para módulos ainda não implementados.
 *
 * COMO USAR:
 *   // Opção 1 — página placeholder simples
 *   import { EmConstrucao } from '@/components/shell/em-construcao'
 *   export default function MeuModuloPage() {
 *     return <EmConstrucao modulo="Meu Módulo" />
 *   }
 *
 *   // Opção 2 — com dica de caminho para o dev
 *   <EmConstrucao modulo="Relatórios" caminho="app/dashboard/relatorios/page.tsx" />
 */

import { Construction, Puzzle } from 'lucide-react'

type Props = {
  /** Nome do módulo exibido na tela */
  modulo: string
  /** Caminho sugerido para criar o arquivo (opcional) */
  caminho?: string
}

export function EmConstrucao({ modulo, caminho }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center">
      {/* Ícone */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] flex items-center justify-center">
          <Construction size={36} className="text-[#7C4DFF]" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] flex items-center justify-center">
          <Puzzle size={14} className="text-[#C084FC]" />
        </div>
      </div>

      {/* Título */}
      <h2 className="text-xl font-bold text-[var(--d2b-text-primary)] text-balance mb-2">
        {modulo}
      </h2>
      <p className="text-sm text-[var(--d2b-text-secondary)] max-w-xs leading-relaxed mb-6">
        Este módulo ainda está em construção e será disponibilizado em breve.
      </p>

      {/* Instrução para o dev */}
      {caminho && (
        <div className="w-full max-w-sm rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] p-4 text-left">
          <p className="text-[10px] font-mono text-[#7C4DFF] uppercase tracking-widest mb-2">
            Para implementar este módulo:
          </p>
          <p className="text-xs font-mono text-[var(--d2b-text-secondary)] leading-relaxed">
            <span className="text-[#C084FC]">1.</span> Crie o arquivo:
            <br />
            <span className="ml-3 text-[var(--d2b-text-primary)] bg-[var(--d2b-bg-main)] rounded px-2 py-0.5 inline-block mt-1">
              {caminho}
            </span>
            <br />
            <span className="text-[#C084FC] mt-2 block">2.</span> Substitua{' '}
            <code className="text-[#7C4DFF]">&lt;EmConstrucao /&gt;</code> pelo
            seu componente.
          </p>
        </div>
      )}
    </div>
  )
}
