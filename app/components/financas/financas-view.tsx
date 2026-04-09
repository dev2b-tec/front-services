'use client'

import { useState } from 'react'
import {
  Landmark, CreditCard, Zap, TrendingDown, TrendingUp,
  Banknote, ScrollText, BarChart2,
  type LucideIcon,
} from 'lucide-react'
import { CaixaContent }                  from './caixa-content'
import { ContaDigitalContent }           from './conta-digital-content'
import { CreditoOlistContent }           from './credito-olist-content'
import { ContasPagarFinancasContent }    from './contas-pagar-financas-content'
import { ContasReceberFinancasContent }  from './contas-receber-financas-content'
import { CobrancasBancariasContent }     from './cobrancas-bancarias-content'
import { ExtratosBancariosContent }      from './extratos-bancarios-content'
import { RelatoriosFinancasContent }     from './relatorios-financas-content'

type TabDef = { id: string; label: string; Icon: LucideIcon; badge?: string }

const TABS: TabDef[] = [
  { id: 'caixa',               label: 'Caixa',               Icon: Landmark     },
  { id: 'conta_digital',       label: 'Conta\nDigital',       Icon: CreditCard,  badge: 'pix grátis' },
  { id: 'credito_olist',       label: 'Crédito\nda Olist',    Icon: Zap,         badge: 'Novo' },
  { id: 'contas_pagar',        label: 'Contas a\nPagar',      Icon: TrendingDown },
  { id: 'contas_receber',      label: 'Contas a\nReceber',    Icon: TrendingUp   },
  { id: 'cobrancas_bancarias', label: 'Cobranças\nBancárias', Icon: Banknote     },
  { id: 'extratos_bancarios',  label: 'Extratos\nBancários',  Icon: ScrollText   },
  { id: 'relatorios',          label: 'Relatórios',           Icon: BarChart2    },
]

function EmBreve({ label }: { label: string }) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center">
        <Landmark size={26} className="text-[var(--d2b-text-muted)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-1">{label}</p>
        <p className="text-sm text-[var(--d2b-text-muted)]">Esta tela está em desenvolvimento.</p>
      </div>
    </div>
  )
}

export function FinancasView() {
  const [active, setActive] = useState(TABS[3].id) // default: contas_pagar

  const content = (() => {
    switch (active) {
      case 'caixa':               return <CaixaContent />
      case 'conta_digital':       return <ContaDigitalContent />
      case 'credito_olist':       return <CreditoOlistContent />
      case 'contas_pagar':        return <ContasPagarFinancasContent />
      case 'contas_receber':      return <ContasReceberFinancasContent />
      case 'cobrancas_bancarias': return <CobrancasBancariasContent />
      case 'extratos_bancarios':  return <ExtratosBancariosContent />
      case 'relatorios':          return <RelatoriosFinancasContent />
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
        {TABS.map(({ id, label, Icon, badge }) => {
          const isActive = active === id
          const clr = isActive ? '#7C4DFF' : '#6B4E8A'
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              title={label.replace('\n', ' ')}
              className={[
                'relative flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all',
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
              {badge && (
                <span className="absolute -top-1 -right-1 text-[7px] font-bold px-1 py-0.5 rounded bg-[#7C4DFF] text-white leading-none">
                  {badge === 'Novo' ? 'novo' : 'pix'}
                </span>
              )}
            </button>
          )
        })}
      </aside>

      {/* ── Conteúdo ── */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {content}
      </main>
    </div>
  )
}
