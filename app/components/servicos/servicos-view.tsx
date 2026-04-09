'use client'

import { useState } from 'react'
import {
  FileText, ClipboardList, Receipt, DollarSign, BarChart2,
  Briefcase, type LucideIcon,
} from 'lucide-react'
import { ContratosContent }          from './contratos-content'
import { OrdensServicoContent }      from './ordens-servico-content'
import { NotasServicoContent }       from './notas-servico-content'
import { CobrancasContent }          from './cobrancas-content'
import { RelatoriosServicoContent }  from './relatorios-servico-content'

type TabDef = { id: string; label: string; Icon: LucideIcon }

const TABS: TabDef[] = [
  { id: 'contratos',         label: 'Contratos',              Icon: FileText      },
  { id: 'ordens_servico',    label: 'Ordens de\nServiço',     Icon: ClipboardList },
  { id: 'notas_servico',     label: 'Notas de\nServiço',      Icon: Receipt       },
  { id: 'cobranças',         label: 'Cobranças',              Icon: DollarSign    },
  { id: 'relatorios',        label: 'Relatórios',             Icon: BarChart2     },
]

function EmBreve({ label }: { label: string }) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center">
        <Briefcase size={26} className="text-[var(--d2b-text-muted)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-1">{label}</p>
        <p className="text-sm text-[var(--d2b-text-muted)]">Esta tela está em desenvolvimento.</p>
      </div>
    </div>
  )
}

export function ServicosView() {
  const [active, setActive] = useState(TABS[0].id)

  const content = (() => {
    switch (active) {
      case 'contratos':      return <ContratosContent />
      case 'ordens_servico': return <OrdensServicoContent />
      case 'notas_servico':  return <NotasServicoContent />
      case 'cobranças':      return <CobrancasContent />
      case 'relatorios':     return <RelatoriosServicoContent />
      default: {
        const tab = TABS.find(t => t.id === active)
        return <EmBreve label={tab?.label.replace('\n', ' ') ?? ''} />
      }
    }
  })()

  return (
    <div className="flex h-full min-h-0">

      {/* ── Painel lateral de ícones ── */}
      <aside className="flex flex-col w-[72px] shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] py-3 gap-0.5 overflow-y-auto">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          const clr = isActive ? '#7C4DFF' : '#6B4E8A'
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              title={label.replace('\n', ' ')}
              className={[
                'flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all',
                isActive ? 'bg-[var(--d2b-hover)]' : 'hover:bg-[var(--d2b-hover)]',
              ].join(' ')}
            >
              <Icon size={20} color={clr} />
              <span
                className="text-[9px] font-medium text-center leading-tight px-1 whitespace-pre-line"
                style={{ color: clr }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── Conteúdo principal ── */}
      <div className="flex-1 overflow-hidden">
        {content}
      </div>
    </div>
  )
}
