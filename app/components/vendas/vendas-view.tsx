'use client'

import { useState } from 'react'
import { CRMContent }               from './crm-content'
import { PDVContent }               from './pdv-content'
import { PropostaComercialContent } from './proposta-comercial-content'
import { NotasFiscaisContent }      from './notas-fiscais-content'
import { AutomacoesContent }        from './automacoes-content'
import { SeparacaoContent }         from './separacao-content'
import { CustosEcommerceContent }   from './custos-ecommerce-content'
import { NFCContent }               from './nfc-content'
import { MargemContribuicaoContent } from './margem-contribuicao-content'
import { DevolucoesContent }        from './devolucoes-content'
import { RelatoriosContent }        from './relatorios-content'
import { MetasVendasContent }       from './metas-vendas-content'
import { PedidosVendaContent }      from './pedidos-venda-content'
import { ComissoesContent }         from './comissoes-content'
import { ExpedicaoContent }         from './expedicao-content'
import { PerformanceVendasContent } from './performance-vendas-content'
import {
  Users, Zap, Monitor, FileText, ShoppingBag, Receipt,
  DollarSign, FileCheck, TrendingUp, BarChart2, Globe,
  Layers, Truck, RotateCcw, BookOpen, Target, type LucideIcon,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
// ─── Tab definition ──────────────────────────────────────────────────────────
type TabDef = { id: string; label: string; Icon: LucideIcon }

const TABS: TabDef[] = [
  { id: 'crm',        label: 'CRM',                        Icon: Users       },
  { id: 'automacoes', label: 'Painel de\nAutomações',      Icon: Zap         },
  { id: 'pdv',        label: 'PDV',                        Icon: Monitor     },
  { id: 'propostas',  label: 'Propostas\nComerciais',      Icon: FileText    },
  { id: 'pedidos',    label: 'Pedidos\nde Venda',          Icon: ShoppingBag },
  { id: 'notas',      label: 'Notas\nFiscais',             Icon: Receipt     },
  { id: 'comissoes',  label: 'Comissões',                  Icon: DollarSign  },
  { id: 'nfc',        label: 'Notas Fiscais\nConsumidor',  Icon: FileCheck   },
  { id: 'performance',label: 'Performance\nde Vendas',     Icon: TrendingUp  },
  { id: 'margem',     label: 'Margem\nContribuição',       Icon: BarChart2   },
  { id: 'custos',     label: 'Custos do\ne-commerce',      Icon: Globe       },
  { id: 'separacao',  label: 'Separação',                  Icon: Layers      },
  { id: 'expedicao',  label: 'Expedição',                  Icon: Truck       },
  { id: 'devolucoes', label: 'Devoluções\nde venda',       Icon: RotateCcw   },
  { id: 'relatorios', label: 'Relatórios',                 Icon: BookOpen    },
  { id: 'metas',      label: 'Performance\nde Vendas',     Icon: Target      },
]

// ─── Em Breve ──────────────────────────────────────────────────────────────
function EmBreve({ label }: { label: string }) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center">
        <span className="text-2xl">🚧</span>
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-1">{label}</p>
        <p className="text-sm text-[var(--d2b-text-muted)]">Esta tela está em desenvolvimento.</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// VendasView
// ═══════════════════════════════════════════════════════════════════════════
export function VendasView() {
  const [active, setActive] = useState(TABS[0].id)

  const content = (() => {
    switch (active) {
      case 'crm':       return <CRMContent />
      case 'automacoes':return <AutomacoesContent />
      case 'pdv':       return <PDVContent />
      case 'propostas': return <PropostaComercialContent />
      case 'pedidos':   return <PedidosVendaContent />
      case 'notas':        return <NotasFiscaisContent />
      case 'comissoes':    return <ComissoesContent />
      case 'performance':  return <PerformanceVendasContent />
      case 'expedicao':    return <ExpedicaoContent />
      case 'separacao':  return <SeparacaoContent />
      case 'custos':     return <CustosEcommerceContent />
      case 'nfc':        return <NFCContent />
      case 'margem':     return <MargemContribuicaoContent />
      case 'devolucoes': return <DevolucoesContent />
      case 'relatorios': return <RelatoriosContent />
      case 'metas':      return <MetasVendasContent />
    }
    const tab = TABS.find(t => t.id === active)
    return <EmBreve label={tab?.label.replace('\n', ' ') ?? ''} />
  })()

  return (
    <div className="flex h-full min-h-0">

      {/* ── Painel lateral de ícones ── */}
      <aside
        className="flex flex-col w-[72px] shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] py-3 gap-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
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
