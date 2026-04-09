'use client'

import { useState } from 'react'
import { Package, Layers, Users, Box, Wrench, BadgePercent, Users2, type LucideIcon } from 'lucide-react'
import { ProdutosList }                  from '@/components/produtos/produtos-list'
import { CategoriasView }                from '@/components/produtos/categorias-view'
import { VendedoresList }                from '@/components/produtos/vendedores-list'
import { EmbalagemView }                 from '@/components/produtos/embalagens-view'
import { ServicosView }                  from '@/components/produtos/servicos-view'
import { CampanhasList }                 from '@/components/produtos/campanhas-list'
import { ClientesFornecedoresList }      from '@/components/produtos/clientes-fornecedores-list'

// ─── Definição das abas ──────────────────────────────────────────────────────
type TabDef = { id: string; label: string; Icon: LucideIcon; iconColor?: string }

const TABS: TabDef[] = [
  { id: 'clientes',    label: 'Clientes',    Icon: Users2       },
  { id: 'produtos',    label: 'Produtos',    Icon: Package      },
  { id: 'categorias',  label: 'Categorias',  Icon: Layers       },
  { id: 'vendedores',  label: 'Vendedores',  Icon: Users        },
  { id: 'embalagens',  label: 'Embalagens',  Icon: Box          },
  { id: 'servicos',    label: 'Serviços',    Icon: Wrench       },
  { id: 'campanhas',   label: 'Campanhas',   Icon: BadgePercent },
]

// ─── CadastrosView ───────────────────────────────────────────────────────────
export function CadastrosView() {
  const [active, setActive] = useState('clientes')

  const content = (() => {
    switch (active) {
      case 'clientes':   return <ClientesFornecedoresList />
      case 'produtos':   return <ProdutosList />
      case 'categorias': return <CategoriasView />
      case 'vendedores': return <VendedoresList />
      case 'embalagens': return <EmbalagemView />
      case 'servicos':   return <ServicosView />
      case 'campanhas':  return <CampanhasList />
      default:           return null
    }
  })()

  return (
    <div className="flex h-full min-h-0">

      {/* ── Painel lateral de ícones ── */}
      <aside className="flex flex-col w-[72px] shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] py-3 gap-0.5 overflow-y-auto">
        {TABS.map(({ id, label, Icon, iconColor }) => {
          const isActive = active === id
          const clr = iconColor ?? (isActive ? '#7C4DFF' : '#6B4E8A')
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              title={label}
              className={[
                'flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all',
                isActive ? 'bg-[var(--d2b-hover)]' : 'hover:bg-[var(--d2b-hover)]',
              ].join(' ')}
            >
              <Icon size={20} color={clr} strokeWidth={isActive ? 2.5 : 1.5} />
              <span
                className="text-[9px] font-medium leading-tight text-center"
                style={{ color: clr }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── Conteúdo da aba ── */}
      <div className="flex-1 overflow-y-auto">
        {content}
      </div>
    </div>
  )
}
